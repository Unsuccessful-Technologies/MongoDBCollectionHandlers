import {MongoClient, Db, ObjectId} from "mongodb";
import {
    CreateUserPayload,
    UserDocInternal,
    UsersControllers,
    DefaultExport,
    UserSpaceHolder
} from "./interfaces";

const Users = (db:Db): UsersControllers => {

    const CreateUser = async (payload: CreateUserPayload): Promise<UserDocInternal> => {
        const Users = db.collection('Users')
        const userScrubbed: CreateUserPayload = {
            fName: payload.fName.toLowerCase(),
            lName: payload.lName.toLowerCase(),
            email: payload.email.toLowerCase(),
            phone: payload.phone,
            password: payload.password
        }
        const response = await Users.insertOne(userScrubbed)
        const result = {
            ...payload,
            _id: response.insertedId
        }
        return result
    }

    const CreateUserSpaceHolder = async (email: string): Promise<UserSpaceHolder> => {
        const UserSpaceHolders = db.collection('UserSpaceHolders')
        const userScrubbed: UserSpaceHolder = {
            _id: new ObjectId(),
            email: email,
            notJoined: true
        }
        const response = await UserSpaceHolders.insertOne(userScrubbed)
        const result = response.insertedId
        return result
    }

    const GetUser = async (query: {[propName:string]: any}): Promise<UserDocInternal> => {
        const Users = db.collection('Users')
        return await Users.findOne(query)
    }

    const GetManyUsers = async (user_ids: string []): Promise<UserDocInternal[]> => {
        const user_obj_ids: ObjectId [] = user_ids.map(id => new ObjectId(id))
        const Users = db.collection('Users')
        const query = { _id: { $in: user_obj_ids } }
        return await Users.find(query, {projection: {password: -1}}).toArray()
    }

    const GetUserByEmail = async (email: string): Promise<UserDocInternal> => {
        const query = {email: email.toLowerCase()}
        return GetUser(query)
    }

    const UserExists = async (email: string): Promise<boolean> => {
        let result = true
        let user = await GetUserByEmail(email)
        return result && !!user

    }

    return {
        CreateUser,
        CreateUserSpaceHolder,
        GetManyUsers,
        GetUserByEmail,
        UserExists
    }
}

const CollectionHandlers = async (dbPromise: Promise<Db>): Promise<DefaultExport> => {
    const db = await dbPromise

    return {
        Users: Users(db)
    }
}

export default CollectionHandlers
