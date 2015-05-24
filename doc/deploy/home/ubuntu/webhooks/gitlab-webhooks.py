# -*- coding: utf-8 -*-
#
# Copyright (C) 2014 Carlos Jenkins <carlos@jenkins.co.cr>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import logging
from sys import stderr
logging.basicConfig(stream=stderr)

import hmac
from hashlib import sha1
from json import loads, dumps
from subprocess import Popen, PIPE
from tempfile import mkstemp
from os import access, X_OK, remove
from os.path import isfile, abspath, normpath, dirname, join, basename

import requests
from ipaddress import ip_address, ip_network
from flask import Flask, request, abort


application = Flask(__name__)


@application.route('/', methods=['GET', 'POST'])
def index():
    """
    Main WSGI application entry.
    """

    path = normpath(abspath(dirname(__file__)))
    hooks = join(path, 'hooks')

    # Only POST is implemented
    if request.method != 'POST':
        abort(501)

    # Gather data
    try:
        payload = loads(request.data)
        meta = {
            'name': payload['repository']['name'],
            'branch': payload['ref'].replace('refs/heads/', ''),
            'event': 'push'
        }
    except:
        abort(400)

    # Possible hooks
    scripts = [
        join(hooks, '{event}-{name}-{branch}'.format(**meta)),
        join(hooks, '{event}-{name}'.format(**meta)),
        join(hooks, '{event}'.format(**meta)),
        join(hooks, 'all')
    ]

    # Check permissions
    scripts = [s for s in scripts if isfile(s) and access(s, X_OK)]
    if not scripts:
        return ''

    # Save payload to temporal file
    _, tmpfile = mkstemp()
    with open(tmpfile, 'w') as pf:
        pf.write(dumps(payload))

    # Run scripts
    ran = {}
    for s in scripts:

        proc = Popen(
            [s, tmpfile, event],
            stdout=PIPE, stderr=PIPE
        )
        stdout, stderr = proc.communicate()

        ran[basename(s)] = {
            'returncode': proc.returncode,
            'stdout': stdout,
            'stderr': stderr,
        }

        # Log errors if a hook failed
        if proc.returncode != 0:
            logging.error('{} : {} \n{}'.format(
                s, proc.returncode, stderr
            ))

    # Remove temporal file
    remove(tmpfile)

    info = config.get('return_scripts_info', False)
    if not info:
        return ''

    output = dumps(ran, sort_keys=True, indent=4)
    logging.info(output)
    return output


if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0')
