import { NextRequest, NextResponse } from 'next/server'
import { getContactedLeads } from '@/lib/firestore-admin-service'

export async function GET(_request: NextRequest) {
  try {
    const leads = await getContactedLeads()

    return NextResponse.json({
      success: true,
      data: leads,
      count: leads.length,
    })
  } catch (error) {
    console.error('Error fetching contacted leads:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch contacted leads',
      },
      { status: 500 }
    )
  }
}
