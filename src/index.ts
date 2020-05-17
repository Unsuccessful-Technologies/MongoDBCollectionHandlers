import {Db, ObjectId} from "mongodb";
import {
    UsersControllers,
    DefaultExport,
    CustomUserDoc,
    CustomUser
} from "./interfaces";

const Users = (db:Db): UsersControllers => {

    async function CreateUser<P>(payload:CustomUser<P>): Promise<CustomUserDoc<P>>  {
        const Users = db.collection('Users')
        const userScrubbed: CustomUser<P> = {
            ...payload,
            fName: payload.fName.toLowerCase(),
            lName: payload.lName.toLowerCase(),
            email: payload.email.toLowerCase(),
            phone: payload.phone
        }
        const response = await Users.insertOne(userScrubbed)
        const result = {
            ...userScrubbed,
            _id: response.insertedId
        }
        return result
    }

    async function GetUser<P>(query: {[propName:string]: any}, pipeline?: Object []): Promise<CustomUserDoc<P>> {
        const Users = db.collection('Users')
        if(!pipeline){
            return await Users.findOne(query)
        } else {
            const ResultArr: CustomUserDoc<P>[] = await Users.aggregate<CustomUserDoc<P>>(pipeline).toArray()
            return ResultArr[0]
        }
    }

    async function GetManyUsers<P> (user_ids: string []): Promise<P[]> {
        const user_obj_ids: ObjectId [] = user_ids.map(id => new ObjectId(id))
        const Users = db.collection('Users')
        const query = { _id: { $in: user_obj_ids } }
        return await Users.find(query, {projection: {password: -1}}).toArray()
    }

    async function GetUserByEmail<P>(email: string, pipeline?: Object[]): Promise<P> {
        const query = {email: email.toLowerCase()}
        return GetUser(query, pipeline)
    }

    async function GetUserById<P>(_id: string, pipeline?: Object[]): Promise<P> {
        const query = {_id: new ObjectId(_id)}
        return GetUser(query, pipeline)
    }

    async function UserExists(email: string): Promise<boolean> {
        let result = true
        let user = await GetUserByEmail(email)
        return result && !!user

    }

    return {
        CreateUser,
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
