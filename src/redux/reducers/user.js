const initialStore = {}

if (localStorage.getItem('user') != null) {
  initialStore.isLogin = true
  initialStore.user = JSON.parse(localStorage.getItem('user'))
} else {
  initialStore.isLogin = false
  initialStore.user = {}
}


const userReducer = (state = initialStore, action) => {
  switch (action.type) {
    case 'LOGIN': {
      const { token, refresh } = action.payload;
      localStorage.setItem('token', token)
      localStorage.setItem('refresh', refresh)
      return {
          ...state,
          isLogin: true,
      }
    }
    case 'LOGOUT': {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('refresh')
      return {
          ...state,
          isLogin: false
      }
    }
    case 'SETUSER': {
      const {user} = action.payload
      localStorage.setItem('user', JSON.stringify(user))
      return {
        ...state,
        user
      }
    }
    default:
      return state
  }
}

export default userReducer