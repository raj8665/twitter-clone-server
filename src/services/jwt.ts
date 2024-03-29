import JWT from 'jsonwebtoken';
import { User } from '@prisma/client';
import { JWTUSer } from '../interfaces';

const JWT_SECRET = '$uper@1234.';

class JWTService {
    public static  generateTokenForUser(user: User) {
         const payload: JWTUSer = {
            id: user?.id,
            email: user?.email,
         };
         const token = JWT.sign(payload,JWT_SECRET );
         return token;
    }
    public static decodeToken(token:string ){
        try {
            return JWT.verify(token,JWT_SECRET) as JWTUSer;
        } catch (error) {
            return null;
        }
        
    }
}

export default JWTService;
