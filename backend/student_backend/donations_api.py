# =============================================
# AfterGrad — Donations API (Supabase-connected)
# =============================================
#
# Endpoints:
#   GET  /api/donations/campaigns        — list campaigns
#   GET  /api/donations/campaigns/{id}   — single campaign
#   POST /api/donations/donate           — make a donation
# =============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_supabase

donations_router = APIRouter(prefix="/api/donations", tags=["donations"])


class DonateRequest(BaseModel):
    campaign_id: str
    donor_id: str
    amount: float


@donations_router.get("/campaigns")
async def list_campaigns():
    sb = get_supabase()
    result = sb.table("donation_campaigns").select("*").order("created_at", desc=True).execute()
    return result.data or []


@donations_router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    sb = get_supabase()
    result = sb.table("donation_campaigns").select("*").eq("id", campaign_id).execute()
    if not result.data:
        raise HTTPException(404, "Campaign not found")
    return result.data[0]


@donations_router.post("/donate")
async def donate(body: DonateRequest):
    sb = get_supabase()

    # Check campaign
    campaign = sb.table("donation_campaigns").select("*").eq("id", body.campaign_id).execute()
    if not campaign.data:
        raise HTTPException(404, "Campaign not found")

    if body.amount <= 0:
        raise HTTPException(400, "Amount must be positive")

    # Record donation
    sb.table("donations").insert({
        "campaign_id": body.campaign_id,
        "donor_id": body.donor_id,
        "amount": body.amount,
    }).execute()

    # Update raised amount
    new_raised = (campaign.data[0].get("raised_amount") or 0) + body.amount
    sb.table("donation_campaigns").update({
        "raised_amount": new_raised,
    }).eq("id", body.campaign_id).execute()

    return {
        "message": "Donation successful!",
        "amount": body.amount,
        "new_total": new_raised,
    }
