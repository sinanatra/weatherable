import db from "$lib/db";

export async function GET({ url }) {
    const dailyId = parseInt(url.searchParams.get("dailyId"));
    const today = new Date().toISOString().split("T")[0];

    if (isNaN(dailyId)) {
        return new Response(JSON.stringify({ error: "Invalid dailyId" }), { status: 400 });
    }

    try {
        const collection = await db.collection("weatherables");
        const document = await collection.findOne({ dailyId, date: today });

        if (!document) {
            return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(document), { status: 200 });
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const { dailyId, tattooed } = await request.json();
        const today = new Date().toISOString().split("T")[0];

        const collection = await db.collection("weatherables");
        const result = await collection.updateOne(
            { dailyId, date: today },
            { $set: { tattooed: tattooed } }
        );

        if (result.matchedCount === 0) {
            return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
