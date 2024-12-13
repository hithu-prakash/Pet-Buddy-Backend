const authorizeUser = (Permissions) =>{
    return(req,res,next)=>{
        if(Permissions.includes(req.user.role)){
            next()
        }else{
            res.status(401).json({errors:"Unauthorized user"})
        }
    }
}
module.exports = authorizeUser