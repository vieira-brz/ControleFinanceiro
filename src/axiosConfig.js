// axiosConfig.js
import axios from 'axios'
import {API_URL} from './config'

// Configuração global do axios para lidar com CORS
axios.defaults.baseURL = API_URL
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*' 

export default axios
