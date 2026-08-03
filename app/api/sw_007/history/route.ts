import { history, apiError } from "../../../../lib/sw007";
export const dynamic="force-dynamic";
export async function GET(){try{return Response.json({success:true,data:await history()});}catch(e){return apiError(e);}}
