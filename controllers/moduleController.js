import asyncHandler from "express-async-handler";
import Module from "../models/moduleModel.js";

export const createModule = asyncHandler(async(req,res)=>{
    const {title, description, isPublic, slides} = req.body;

    const module = await Module.create({
        title,
        description,
        isPublic,
        slides,
        educator: req.user._id
    });

    res.status(201).json(module);
});

export const getPublicModules = asyncHandler(async(req,res)=>{
    const modules = await Module.find({isPublic: true}).sort({createdAt: -1}).populate('educator','name');

    res.status(200).json(modules);
})

export const getModuleById = asyncHandler(async(req,res)=>{
    const module = await Module.findById(req.params.id).populate('educator', 'name');

    if(module){
        res.status(200).json(module);
    }
    else{
        res.status(404);
        throw new Error("Module not found");
    }
})