import tornado.web
import logging
import json

import sys
sys.path.append("/home/pi/amp_iot/amp_iot")

from amp_iot.src.lib.framework.client import Client

logger = logging.getLogger(__name__)


class AmpSettings(tornado.web.RequestHandler):

    AUDIO_OPTION_REQUEST_PATH = 'mopidy/audio_option'

    def initialize(self, config):
        host = 'localhost' # config['amp_application_host']
        port = 7032 # config['amp_application_host']
        self._amp_application_client = Client(host, port)

    def get(self, *args, **kwargs):
        logger.debug(kwargs)
        logger.debug(args)

    # handle post requests
    def post(self):
        args = self.request.arguments
        logger.debug(args)

        if 'type' not in args:
            logger.warning('No type specified')
            # raise HTTPError(405)
            return

        call_type = str(args['type'][0])
        
        if call_type not in ['set', 'get']:
            logger.warning('Invalid type')
            return

        if 'method' not in args:
            logger.warning('No method specified')
            # raise HTTPError(405)
            return

        method = args['method'][0]

        if method == 'MainVolumeMenu':
            method = 'MainVolume'

        return_data = ''
        if call_type == 'get':
            if method == 'getAllAmpSettings':
                return_data = self._get_all_settings(json.loads(args['data'][0]))
            else:
                return_data = self._get_settings(method)

        if call_type == 'set':
            value = args['value'][0]
            return_data = self._set_settings(method, value)

        self.write(json.dumps(return_data))

    def _get_all_settings(self, data):
        return_data = {
            'slider': [],
            'checkbox': [],
            'select': [],
        }
        for method in data['slider']:
            if method == 'MainVolumeMenu':
                method = 'MainVolume'

            value = self._get_settings(method)
            return_data['slider'].append({'id': method, 'value': value})

        for method in data['checkbox']:
            value = self._get_settings(method)
            return_data['checkbox'].append({'id': method, 'value': value})

        for method in data['select']:
            value = self._get_settings(method)
            return_data['select'].append({'id': method, 'value': value})

        return return_data

    # retrive data from audio client
    def _get_settings(self, method):
        data = {
            'method_name': 'get' + method,
            'args': {}
        }
        value = self._amp_application_client.send(self.AUDIO_OPTION_REQUEST_PATH, data)

        return value

    # send data to audio client
    def _set_settings(self, method, value):
        data = {
            'method_name': 'set' + method,
            'args': {0: value}
        }
        self._amp_application_client.send(self.AUDIO_OPTION_REQUEST_PATH, data)
        return self._get_settings(method)
