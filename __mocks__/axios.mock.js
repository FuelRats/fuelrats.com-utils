import axios from 'axios'

import MockAdapter from 'axios-mock-adapter'
import { HttpStatus } from '../src/http'



const mock = new MockAdapter(axios)





export {
  axios,
  mock,
}
