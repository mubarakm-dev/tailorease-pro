"use server"

import bcrypt from "bcryptjs";
import { prisma } from "../libs/prisma";
import { match } from "assert";

const login = async (data: { email: string; password: string }) => {

    if(!data.email || !data.password) {
        throw new Error("Email and password are required")
    }
    const staff = await prisma.staff.findUnique({
        where:{email: data.email}
    })
    if(!staff) {
        throw new Error("Invalid email or password")
    }

    const isMatch = await bcrypt.compare(data.password, staff.passwordHash)

    if(!match){
         throw new Error("Invalid email or password")
    }

    
}