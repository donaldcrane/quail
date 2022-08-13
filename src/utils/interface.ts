export interface IUser {
  id?: string
  email?: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  photo?: string
  balance: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CustomRequest {
  user: IUser
  file: string[]
  params: string[]
  query: string[]
  path: string[]
}

export interface ILogin {
  email: string
  password: string
}

export interface IAccount {
  id: string
  bankName: string
  owner: string
  accountNo: string
}

export interface IBeneficiary {
  beneficiaryId: string
}

export interface IDebit {
  id: string
  amount: number
  type: string
  status: string
  owner: string
}

export interface ICredit {
  id: string
  amount: number
  type: string
  status: string
  reference: string
  owner: string
  sender: string
  0: any
}

export interface IDebitValidate {
  debitId: string
}

export interface ICreditValidate {
  creditId: string
}
