import { Server, routePartykitRequest, type Connection } from 'partyserver'
import { QUOTES } from '../shared/quotes'

export type Player = {
  id: string
  name: string
  ready: boolean
  progress: number
  wpm: number
  accuracy: number
  finished: boolean
  disconnected: boolean
}

export type RoomStatus = 'lobby' | 'countdown' | 'racing' | 'finished'

export type RoomState = {
  status: RoomStatus
  quote: { text: string; src: string } | null
  startAt: number | null
  players: Record<string, Player>
}

type ClientMsg =
  | { type: 'join'; playerId: string; name: string }
  | { type: 'ready' }
  | { type: 'progress'; progress: number; wpm: number; accuracy: number }
  | { type: 'finish'; wpm: number; accuracy: number; timeMs: number }
  | { type: 'rematch' }

function pickQuote(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return QUOTES[h % QUOTES.length]!
}

export class RaceServer extends Server {
  state: RoomState = {
    status: 'lobby',
    quote: null,
    startAt: null,
    players: {},
  }

  connectionPlayer = new Map<string, string>()

  broadcastState() {
    this.broadcast(JSON.stringify({ type: 'state', state: this.state }))
  }

  onConnect(conn: Connection) {
    conn.send(JSON.stringify({ type: 'state', state: this.state }))
  }

  onClose(conn: Connection) {
    const playerId = this.connectionPlayer.get(conn.id)
    if (!playerId) return
    this.connectionPlayer.delete(conn.id)
    const p = this.state.players[playerId]
    if (p) {
      p.disconnected = true
      this.broadcastState()
    }
  }

  onMessage(conn: Connection, message: string | ArrayBuffer) {
    if (typeof message !== 'string') return
    let msg: ClientMsg
    try {
      msg = JSON.parse(message) as ClientMsg
    } catch {
      return
    }

    if (msg.type === 'join') {
      const { playerId, name } = msg
      this.connectionPlayer.set(conn.id, playerId)
      const existing = this.state.players[playerId]
      if (existing) {
        existing.disconnected = false
        existing.name = name.slice(0, 24) || existing.name
      } else if (this.state.status === 'lobby' || this.state.status === 'finished') {
        this.state.players[playerId] = {
          id: playerId,
          name: name.slice(0, 24) || `Guest-${playerId.slice(0, 4)}`,
          ready: false,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
          disconnected: false,
        }
      } else {
        // late join — spectate only (no player entry)
        conn.send(JSON.stringify({ type: 'state', state: this.state }))
        return
      }
      this.broadcastState()
      return
    }

    const playerId = this.connectionPlayer.get(conn.id)
    if (!playerId || !this.state.players[playerId]) return
    const player = this.state.players[playerId]!

    if (msg.type === 'ready') {
      if (this.state.status !== 'lobby' && this.state.status !== 'finished') return
      if (this.state.status === 'finished') {
        // reset to lobby for rematch readiness
        this.resetToLobby()
      }
      player.ready = !player.ready
      this.broadcastState()
      this.maybeStartCountdown()
      return
    }

    if (msg.type === 'progress') {
      if (this.state.status !== 'racing') return
      player.progress = Math.min(1, Math.max(0, msg.progress))
      player.wpm = msg.wpm
      player.accuracy = msg.accuracy
      this.broadcastState()
      return
    }

    if (msg.type === 'finish') {
      if (this.state.status !== 'racing') return
      player.finished = true
      player.progress = 1
      player.wpm = msg.wpm
      player.accuracy = msg.accuracy
      const active = Object.values(this.state.players).filter((p) => !p.disconnected)
      if (active.every((p) => p.finished)) {
        this.state.status = 'finished'
      }
      this.broadcastState()
      return
    }

    if (msg.type === 'rematch') {
      this.resetToLobby()
      this.broadcastState()
    }
  }

  resetToLobby() {
    this.state.status = 'lobby'
    this.state.quote = null
    this.state.startAt = null
    for (const p of Object.values(this.state.players)) {
      if (p.disconnected) {
        delete this.state.players[p.id]
        continue
      }
      p.ready = false
      p.progress = 0
      p.wpm = 0
      p.accuracy = 100
      p.finished = false
    }
  }

  maybeStartCountdown() {
    const active = Object.values(this.state.players).filter((p) => !p.disconnected)
    if (active.length < 2) return
    if (!active.every((p) => p.ready)) return

    this.state.status = 'countdown'
    this.state.quote = pickQuote(this.name)
    this.state.startAt = Date.now() + 3000
    for (const p of active) {
      p.ready = false
      p.progress = 0
      p.finished = false
      p.wpm = 0
      p.accuracy = 100
    }
    this.broadcastState()

    // transition to racing when startAt hits
    const delay = Math.max(0, this.state.startAt - Date.now())
    setTimeout(() => {
      if (this.state.status === 'countdown') {
        this.state.status = 'racing'
        this.broadcastState()
      }
    }, delay)
  }
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const origin = request.headers.get('Origin') || '*'
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      })
    }

    return (
      (await routePartykitRequest(request, env)) ||
      new Response('TypeRace party worker', {
        headers: { 'Access-Control-Allow-Origin': origin },
      })
    )
  },
}
