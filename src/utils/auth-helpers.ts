import bcrypt from 'bcryptjs'
import jwt  from 'jsonwebtoken'

export const correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

export const createSendToken = (user: any) => {
  const token = signToken(user.id)

  // Remove password from output
  user.password = undefined

  return {
    status: 'success',
    token,
    user,
  }
}