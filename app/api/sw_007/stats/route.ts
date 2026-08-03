import { stats, apiError } from "../../../../lib/sw007";
export const dynamic="force-dynamic";
export async function GET(){try{return Response.json({success:true,data:await stats()});}catch(e){return apiError(e);}}
