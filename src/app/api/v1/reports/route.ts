import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const totalInquiries = inquiries.length;

    // Status counts
    const statusCounts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      QUOTED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      REJECTED: 0,
    };

    inquiries.forEach((inq) => {
      if (statusCounts[inq.status] !== undefined) {
        statusCounts[inq.status]++;
      }
    });

    const activeBookings = statusCounts.CONFIRMED + statusCounts.COMPLETED;
    const conversionRate = totalInquiries > 0 ? Math.round((activeBookings / totalInquiries) * 100) : 0;

    // Service Breakdown
    const serviceMap: Record<string, number> = {};
    inquiries.forEach((inq) => {
      const s = inq.service || 'General Photography';
      serviceMap[s] = (serviceMap[s] || 0) + 1;
    });

    const serviceBreakdown = Object.entries(serviceMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalInquiries > 0 ? Math.round((count / totalInquiries) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Package Breakdown
    const packageMap: Record<string, number> = {};
    inquiries.forEach((inq) => {
      const p = inq.package || 'Custom Quote';
      packageMap[p] = (packageMap[p] || 0) + 1;
    });

    const packageBreakdown = Object.entries(packageMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalInquiries > 0 ? Math.round((count / totalInquiries) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Monthly Trend (Last 6 months)
    const monthlyMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[key] = 0;
    }

    inquiries.forEach((inq) => {
      const inqDate = new Date(inq.createdAt);
      const key = inqDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key]++;
      }
    });

    const monthlyTrends = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      count,
    }));

    // Estimate pipeline revenue (extract numbers from budget or package strings)
    let estimatedPipelineETB = 0;
    inquiries.forEach((inq) => {
      if (inq.status === 'CONFIRMED' || inq.status === 'COMPLETED' || inq.status === 'QUOTED') {
        const budgetStr = (inq.budget || inq.package || '').replace(/[^0-9]/g, '');
        const amount = parseInt(budgetStr, 10);
        if (!isNaN(amount) && amount > 0) {
          estimatedPipelineETB += amount;
        } else {
          // Default average session estimate if unspecified (15,000 ETB)
          estimatedPipelineETB += 15000;
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalInquiries,
          newInquiries: statusCounts.NEW,
          contactedInquiries: statusCounts.CONTACTED,
          confirmedBookings: statusCounts.CONFIRMED,
          completedSessions: statusCounts.COMPLETED,
          conversionRate,
          estimatedPipelineETB,
        },
        statusCounts,
        serviceBreakdown,
        packageBreakdown,
        monthlyTrends,
        recentInquiries: inquiries.slice(0, 10),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
  }
}
