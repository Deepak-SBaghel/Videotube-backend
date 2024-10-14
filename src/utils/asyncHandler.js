//we write this wrapper so that we can just use this instead of writing this everytime
// use to make promise call (asyncnanous calls)
// USE ONLY WHERE MAKING WEB REQUEST 
const asyncHandler = (requestHandler) => {
    //here the req,res,next are called form inside teh function 
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
