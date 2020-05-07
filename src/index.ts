import {MongoClient, Db, ObjectId} from "mongodb";

export interface User {
    fName: string;
    lName: string;
    email: string;
    phone: string;
}

interface CreateUserPayload extends User {
    _id?: ObjectId;
    password: string;
}

export interface UserDocInternal extends User {
    _id: string;
    password: string;
}

interface CreateUser {
    (payload: CreateUserPayload) : Promise<UserDocInternal>
}

interface UsersControllers {
    CreateUser: CreateUser
}

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

    return {
        CreateUser
    }
}

interface DefaultExport {
    Users: UsersControllers;
}

const CollectionHandlers = async (dbPromise: Promise<Db>): Promise<DefaultExport> => {
    const db = await dbPromise

    return {
        Users: Users(db)
    }
}

export default CollectionHandlers
