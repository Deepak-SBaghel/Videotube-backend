//we write this wrwpper so that we can just use this instead of wrutun this everytime
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err));
    };
};

// const asyncHandler= (fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next);
//     }catch(error){
//         res.status(error.cade||500).json({
//             sucessfull:false,
//             error_message:error.message
//         })

//     }
// }
export { asyncHandler };
