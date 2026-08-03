import { listDomains, saveDomain, apiError } from "../../../../lib/sw007";
export const dynamic="force-dynamic";
export async function GET(r:Request){const u=new URL(r.url);try{return Response.json({success:true,data:await listDomains(u.searchParams.get("q")??"",u.searchParams.get("use")??"all",u.searchParams.get("type")??"all")});}catch(e){return apiError(e);}}
export async function POST(r:Request){try{return Response.json({success:true,data:await saveDomain(undefined,await r.json())});}catch(e){return apiError(e);}}
export async function PUT(r:Request){try{const d=await r.json();return Response.json({success:true,data:await saveDomain(Number(d.domain_seq),d)});}catch(e){return apiError(e);}}
