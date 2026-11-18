import { arca } from './arca.js'
import { idram } from './idram.js'
import { simulator } from './simulator.js'

// Online payment methods. A method is offered at checkout only once its
// merchant credentials are set in the server environment.
export const PROVIDERS = { arca, idram, test: simulator }

export function getProvider(id) {
  return Object.hasOwn(PROVIDERS, id) ? PROVIDERS[id] : null
}

export function availableMethods() {
  return Object.values(PROVIDERS).filter((p) => p.configured()).map((p) => p.id)
}
