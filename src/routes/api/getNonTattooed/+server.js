import db from "$lib/db";

export async function GET() {
    try {
        const n = 50;
        const today = new Date().toISOString().split("T")[0];
        const collection = await db.collection("weatherables");

        const documents = await collection.find({
            tattooed: { $ne: true },
            date: today
        })
            // .sort({ _id: -1 })
            .limit(n)
            .toArray();

        return new Response(JSON.stringify(documents), { status: 200 });
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
