import {ObjectId} from 'bson'

export interface User {
    fName: string;
    lName: string;
    email: string;
    phone: string;
}

export type CustomUser<T extends {}> = T & User

export interface UserDoc extends User {
    _id : ObjectId |string;
}

export type CustomUserDoc<T extends {}> = T & UserDoc

export interface UserInternalDoc extends UserDoc {
    password: string;
}

export type CustomUserInternalDoc<T extends {}> = T & UserInternalDoc


export interface UsersControllers {
    CreateUser<P>(payload: CustomUser<P>): Promise<CustomUserDoc<P>>;
    GetManyUsers<P>(user_ids: string []): Promise<CustomUserDoc<P>[]>;
    GetUserByEmail<P>(email: string): Promise<CustomUserInternalDoc<P>>;
    UserExists(email: string): Promise<boolean>;
}

export interface DefaultExport {
    Users: UsersControllers;
}