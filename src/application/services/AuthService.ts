import jwt from 'jsonwebtoken';

/**
* @class IamService used for authenticating users
*/
export default class IamService {
    generateAuthResponse(principalId: string, effect: string, methodArn: string, permissionData = ''): any {
        const policyDocument = this.generatePolicyDocument(effect, methodArn);
    
        return {
            context: permissionData,
            principalId,
            policyDocument
        }
    }

    generatePolicyDocument(effect: string, methodArn: string): any {
        if (!effect || !methodArn) return null
    
        const policyDocument = {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: methodArn
            }]
        };
    
        return policyDocument;
    }

    parseBearerToken(authorization = ''): string | null {
        if (authorization.length === 0) return null;
      
        const parts = authorization.split(' ');
        if (parts.length < 2) return null;
      
        const schema = (parts.shift() as string).toLowerCase();
        if (schema !== 'bearer') return null;
      
        return parts.join(' ');
      }


  /**
   * create access token to monitor if uder is logged in or out
   * @param id
   * signAccessToken(id);
   * // returns JWT token
   * @returns {String} returns The JSON Web Token string
   */
    signAccessToken = (id: string): string => {
        const JWT_SECRET = '123';
        return jwt.sign({ id }, JWT_SECRET, {
          expiresIn: '1d',
        });
      };

    /**
    * Receives an array of headers and extract the value from the cookie header
    * @param  {String}   errors List of errors
    * @return {Object}
    */
    getCookiesFromHeader(headers: any): any {
        if (headers === null || headers === undefined || headers.Cookie === undefined) return {};
    
        // Split a cookie string in an array (Originally found http://stackoverflow.com/a/3409200/1427439)
        const list: any = {},
            rc: any = headers.Cookie;
    
        rc && rc.split(';').forEach(function (cookie: any) {
            const parts = cookie.split('=');
            const key = parts.shift().trim()
            const value = decodeURI(parts.join('='));
            if (key != '') {
                list[key] = value
            }
        });
    
        return list;
    }

    /**
    * Build a string appropriate for a `Set-Cookie` header.
    * @param {string} key     Key-name for the cookie.
    * @param {string} value   Value to assign to the cookie.
    * @param {object} options Optional parameter that can be use to define additional option for the cookie.
    * ```
    * {
    *     secure: boolean // Watever to output the secure flag. Defaults to true.
    *     httpOnly: boolean // Watever to ouput the HttpOnly flag. Defaults to true.
    *     domain: string // Domain to which the limit the cookie. Default to not being outputted.
    *     path: string // Path to which to limit the cookie. Defaults to '/'
    *     expires: UTC string or Date // When this cookie should expire.  Default to not being outputted.
    *     maxAge: integer // Max age of the cookie in seconds. For compatibility with IE, this will be converted to a
    *          `expires` flag. If both the expires and maxAge flags are set, maxAge will be ignores. Default to not being
    *           outputted.
    * }
    * ```
    * @return string
    */
     setCookieString(key: string, value: string, options: Record<string, any> = {
        secure: true,
        httpOnly: true,
        domain: false,
        expires: false,
        maxAge: false
    }): string {
    
        // const defaults = {
        //     secure: true,
        //     httpOnly: true,
        //     domain: false,
        //     expires: false,
        //     maxAge: false
        // }

        // options = Object.assign({}, defaults, options);
    
        // if (typeof options == 'object') 
        //     options = Object.assign({}, defaults, options);
        // else 
        //     options = defaults;
    
        let cookie = key + '=' + value;
        if (options.domain) 
            cookie = cookie + '; domain=' + options.domain;
            console.log(cookie);
            
        if (options.path) 
            cookie = cookie + '; path=' + options.path;
            console.log(cookie);
        if (!options.expires && options.maxAge) 
            options.expires = new Date(new Date().getTime() + parseInt(options.maxAge) * 1000); // JS operate in Milli-seconds
        if (typeof options.expires == "object" && typeof options.expires.toUTCString) 
            options.expires = options.expires.toUTCString();
        if (options.expires) 
            cookie = cookie + '; expires=' + options.expires.toString();
            console.log(cookie);
        if (options.secure) 
            cookie = cookie + '; Secure';
            console.log(cookie);
        if (options.httpOnly) 
            cookie = cookie + '; HttpOnly';
            console.log(cookie);
    
        return cookie;
    }
}