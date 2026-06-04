import { createStartHandler, defaultRenderHandler } from '@tanstack/start/server'
import { createRouter } from '../src/router'

export default createStartHandler({
  createRouter,
})(defaultRenderHandler)
