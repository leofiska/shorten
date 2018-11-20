<script>
export default {
  name: 'api',
  props: [
    'token',
    'stoken',
    'online',
    'baseUrl'
  ],
  render () {
    return {
    }
  },
  data () {
    return {
      bindings: [],
      subscriptions: [],
      loading: false,
      socket: null,
      url: 'wss://' + this.baseUrl + '/fboard/api',
      createSocket: function () {
        delete this.socket
        this.socket = null
        try {
          this.socket = new WebSocket(this.url)
        } catch (e) {
          setTimeout(this.createSocket.bind(this), 500)
          return
        }
        this.socket.onopen = () => {
          this.send({f: 'token', token: this.token, stoken: this.stoken}, true)
          for (var i = 0; i < this.subscriptions.length; i++) {
            this.subscribe(this.bindings[this.subscriptions[i] - 1])
          }
        }
        this.socket.onmessage = (e) => {
          try {
            var obj = JSON.parse(e.data)
            this.executeServerMessage(obj)
          } catch (e) {
          }
        }
        this.socket.onclose = (e) => {
          this.$emit('setOnline', false)
          setTimeout(this.createSocket.bind(this), 300)
        }
        this.socket.onerror = (e) => {
          this.$emit('setOnline', false)
          this.socket.onclose = function () {}
          this.socket.close()
          setTimeout(this.createSocket.bind(this), 300)
        }
      },
      send: function (f, forced) {
        if (((forced !== undefined && forced === true) || this.online === true) &&
          this.socket &&
          this.socket !== null &&
          this.socket !== undefined &&
          this.socket.send !== undefined &&
          this.socket.readyState === this.socket.OPEN) {
          try {
            this.socket.send(JSON.stringify(f))
          } catch (e) {
            console.log('exception while sending message to backend')
          }
        } else {
          // socket is not ready to send messages, reschedule
          // console.log('socket not ready, rescheduling')
          setTimeout(this.send.bind(this), 50, f)
        }
      },
      executeServerMessage: function (obj) {
        switch (obj.f) {
          case 'token':
            if (obj.error !== false) {
              this.$emit('settoken', null)
              this.$emit('setstoken', null)
              localStorage.removeItem('token')
              sessionStorage.removeItem('stoken')
              this.$router.push('/')
              return
            }
            localStorage.setItem('token', obj.content.token)
            sessionStorage.setItem('stoken', obj.content.stoken)
            this.$emit('settoken', obj.content.token)
            this.$emit('setstoken', obj.content.stoken)
            this.$emit('setid', obj.content.id)
            this.$emit('setOnline', true)
            break
          default:
            // console.log('received')
            // console.log(obj)
            if (this.bindings[obj.tid - 1] !== undefined && this.bindings[obj.tid - 1] !== null) {
              this.bindings[obj.tid - 1].storno(obj).bind(this.bindings[obj.tid - 1].context)
            }
            break
        }
      }
    }
  },
  mounted () {
    this.createSocket()
  },
  methods: {
    login: function (id, pass) {
      if (id === undefined || pass === undefined || id === '' || pass === '') return false
      this.send({ f: 'login', id: id, pass: pass })
    },
    logout: function () {
      if (localStorage.getItem('token') === null || localStorage.getItem('token') === undefined) return false
      this.send({ f: 'logout', token: localStorage.getItem('token') })
    },
    fetch: function (request) {
      if (request.sync.tid < 0) {
        request.sync.tid = this.bindings.push(request)
      }
      this.send({ f: request.method, options: request.options, tid: request.sync.tid })
    },
    subscribe: function (request) {
      if (!this.online) {
        setTimeout(this.subscribe.bind(this), 100, request)
        return
      }
      if (request.sync.tid < 0) {
        request.sync.tid = this.bindings.push(request)
        this.subscriptions.push(request.sync.tid)
      }
      this.send({ f: request.method, options: request.options, tid: request.sync.tid })
    },
    unsubscribe: function (request) {
      this.bindings[request.sync.tid - 1] = null
      this.subscriptions.splice(this.subscriptions.indexOf(request.sync.tid), 1)
      this.send({ f: request.method, options: request.options, tid: request.sync.tid })
    }
  }
}
</script>
