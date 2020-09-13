export const login = (token, refresh) => ({
  type: 'LOGIN',
  payload: {
    token,
    refresh
  }
})

export const logout = () => ({
  type: 'LOGOUT',
})

export const setUser = (user) => ({
  type: 'SETUSER',
  payload: {
    user
  }
})