<script>
export default {
  name: 'api',
  props: [
    'token',
    'stoken',
    'ltoken',
    'online',
    'apiUrl',
    'user'
  ],
  render () {
    return {
    }
  },
  data () {
    return {
      tid: 0,
      reconnect: null,
      bindings: {
        lock: false,
        objects: []
      },
      loading: false,
      socket: null,
      url: 'wss://' + this.apiUrl + '/api',
      createSocket: function () {
        delete this.socket
        this.socket = null
        this.reconnect = null
        try {
          this.socket = new WebSocket(this.url)
        } catch (e) {
          setTimeout(this.createSocket.bind(this), 500)
          return
        }
        this.socket.onopen = () => {
          this.send({f: 'token', token: this.token, stoken: this.stoken}, true)
        }
        this.socket.onmessage = (e) => {
          try {
            var obj = JSON.parse(e.data)
            this.executeServerMessage(obj)
          } catch (e) {
          }
        }
        this.socket.onclose = (e) => {
          this.socket.onerror = function () {}
          this.$emit('setOnline', false)
          if (this.reconnect === null) {
            this.reconnect = setTimeout(this.createSocket.bind(this), 300)
          }
        }
        this.socket.onerror = (e) => {
          this.socket.onclose = function () {}
          this.$emit('setOnline', false)
          this.socket.close()
          if (this.reconnect === null) {
            this.reconnect = setTimeout(this.createSocket.bind(this), 300)
          }
        }
      },
      send: function (f, forced) {
        this.$emit('setltoken', sessionStorage.getItem('ltoken') || localStorage.getItem('ltoken'))
        // this.$emit('setlanguage', localStorage.getItem('language'))
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
        var i = 0
        switch (obj.f) {
          case 'auth':
            this.$emit('setready', true)
            if (obj.error !== false) {
              this.$emit('setltoken', null)
              sessionStorage.removeItem('ltoken')
              localStorage.removeItem('ltoken')
              if (this.user !== null) {
                this.$emit('setuser', null)
                this.$router.push('/')
                window.scrollTo(0, 0)
                this.$emit('setltoken', null)
              }
            }
            if (obj.user !== undefined) {
              this.$emit('setuser', obj.user)
            }
            for (i = 0; this.bindings.objects[i] !== undefined; i++) {
              if (this.bindings.objects[i] !== null && this.bindings.objects[i].options !== undefined && this.bindings.objects[i].options.f === 'subscribe') {
                this.resubscribe(this.bindings.objects[i])
              }
            }
            this.$emit('setOnline', true)
            break
          case 'user':
            this.$emit('setuser', obj.el)
            break
          case 'reauth':
            this.$emit('setltoken', sessionStorage.getItem('ltoken') || localStorage.getItem('ltoken'))
            break
          case 'token':
            if (obj.error !== false) {
              this.$emit('settoken', null)
              this.$emit('setstoken', null)
              localStorage.removeItem('token')
              sessionStorage.removeItem('stoken')
              this.$router.push('/')
              window.scrollTo(0, 0)
              return
            }
            this.send({f: 'auth', ltoken: this.ltoken}, true)
            localStorage.setItem('token', obj.content.token)
            sessionStorage.setItem('stoken', obj.content.stoken)
            this.$emit('settoken', obj.content.token)
            this.$emit('setstoken', obj.content.stoken)
            this.$emit('setid', obj.content.id)
            this.$emit('setOnline', true)
            break
          case 'logout':
            if (obj.error === false) {
              if (sessionStorage.getItem('ltoken') !== undefined && sessionStorage.getItem('ltoken') !== null) {
                sessionStorage.removeItem('ltoken')
              }
              if (localStorage.getItem('ltoken') !== undefined && localStorage.getItem('ltoken') !== null) {
                localStorage.removeItem('ltoken')
                this.send({ f: 'token', options: { f: 'reauth' } })
              }
              this.$emit('setltoken', null)
              this.$emit('setuser', null)
              this.$router.push('/')
              window.scrollTo(0, 0)
            }
            break
          default:
            if (this.bindings.lock !== false) {
              setTimeout(this.executeServerMessage.bind(this), 100, obj)
              return
            }
            for (i = 0; this.bindings.objects[i] !== undefined; i++) {
              if (this.bindings.objects[i].sync.tid === obj.tid) {
                this.bindings.objects[i].storno(obj).bind(this.bindings.objects[i].context)
                break
              }
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
    sendonly: function (request) {
      if (request.sync !== undefined) {
        if (request.sync.tid < 0) {
          request.sync.tid = this.bindings.objects.push(request)
        }
        this.send({f: request.method, options: request.options, tid: request.sync.tid})
      } else {
        this.send({f: request.method, options: request.options})
      }
    },
    fetch: function (request) {
      this.$emit('setloading', true)
      if (request.sync !== undefined) {
        if (request.sync.tid < 0) {
          request.sync.tid = this.tid++
          request.sync.tid = this.bindings.objects.push(request)
        }
        this.send({f: request.method, options: request.options, tid: request.sync.tid})
      } else {
        this.send({f: request.method, options: request.options})
      }
    },
    getsentences: function (request) {
      this.$emit('setloading', true)
      if (request.sync !== undefined) {
        this.bindings.lock = true
        request.sync.tid = this.tid++
        this.bindings.objects.push(request)
        this.bindings.lock = false
        this.send({f: request.method, options: request.options, tid: request.sync.tid})
      }
    },
    setlanguage: function (language, languageCode) {
      this.send({f: 'user', options: {f: 'setlanguage', language: language, language_code: languageCode}})
    },
    subscribe: function (request) {
      if (this.online === false || this.bindings.lock === true) {
        setTimeout(this.subscribe.bind(this), 100, request)
        return
      }
      this.bindings.lock = true
      request.sync.tid = this.tid++
      this.bindings.objects.push(request)
      this.bindings.lock = false
      if (request.sync.filter !== undefined && request.sync.filter.search !== undefined && request.sync.filter.search !== null && request.sync.filter.search.trim() !== '') {
        request.options.search = request.sync.filter.search.trim()
      }
      this.send({ f: request.method, options: request.options, tid: request.sync.tid })
    },
    resubscribe: function (request) {
      if (this.online === false) {
        setTimeout(this.resubscribe.bind(this), 100, request)
        return
      }
      if (request.sync.filter !== undefined && request.sync.filter.search !== undefined && request.sync.filter.search !== null && request.sync.filter.search.trim() !== '') {
        request.options.search = request.sync.filter.search.trim()
      }
      this.send({ f: request.method, options: request.options, tid: request.sync.tid })
    },
    unsubscribe: function (request) {
      if (this.online === false || this.bindings.lock === true) {
        setTimeout(this.unsubscribe.bind(this), 100, request)
        return
      }
      this.bindings.lock = true
      for (var i = 0; this.bindings.objects[i] !== undefined; i++) {
        if (this.bindings.objects[i].sync.tid === request.sync.tid) {
          this.bindings.objects[i] = null
          break
        }
      }
      var tmp = this.bindings.objects
      this.bindings.objects = tmp.filter(function (el) {
        return el != null
      })
      tmp = null
      this.bindings.lock = false
      this.send({ f: request.method, options: request.options, tid: request.sync.tid })
    }
  },
  watch: {
    ltoken: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.send({f: 'auth', ltoken: this.ltoken}, true)
      }
      if (newVal === null) {
        this.$router.push('/')
      }
    }
  }
}
</script>
