import { Prisma } from "@prisma/client";
import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";

interface GoogleTokenResult{
    iss: 'https://accounts.google.com',
    azp: '398020698451-a1s11tgcjduffell5mc0237v777o4788.apps.googleusercontent.com',
    aud: '398020698451-a1s11tgcjduffell5mc0237v777o4788.apps.googleusercontent.com',
    sub: '117060379909570757431',
    email: 'rajchaturvedi07032004@gmail.com',
    email_verified: 'true',
    nbf: '1711476679',
    name: 'RAJ',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocLc_oVGCqIwNGKaKmW8RtT9sYXtFZgYFK0oenVxTmDEZw=s96-c',
    given_name: 'RAJ',
    family_name: 'Chaturvedi',
    iat: '1711476979',
    exp: '1711480579',
    jti: 'ca727e0e94e410dc71159142d52d2b8d98295758',
    alg: 'RS256',
    kid: 'adf5e710edfebecbefa9a61495654d03c0b8edf8',
    typ: 'JWT'
  }

const queries = {
    verifyGoogleToken: async( parent: any, {token} : {token:string}) => {
            const googleToken = token;
            const googleOAuthURL = new URL('https://oauth2.googleapis.com/tokeninfo')
            googleOAuthURL.searchParams.set('id_token', googleToken)
              
            const  {data} = await axios.get<GoogleTokenResult>(googleOAuthURL.toString(), {
                responseType: 'json'
            })

            const user = await prismaClient.user.findUnique({
                where: { email: data.email },
            });
            // If there is no user we are going to create a new user
            if(!user) {
                 await prismaClient.user.create({
                    data: {
                        email: data.email,
                        firstName: data.given_name,
                        lastName: data.family_name,
                         profileImageURL: data.picture, 
                    },
                 });
            }
            const userInDb = await prismaClient.user.findUnique({
                where: {email: data.email},  
            })

            if(!userInDb) throw new Error('User with email not found')

            const userToken = JWTService.generateTokenForUser(userInDb)
            return userToken;
    },
};

export const resolvers = {queries};