import db from "$lib/db";

export const POST = async ({ request }) => {
    try {
        const data = await request.json();

        if (data.answer) {
            const collection = await db.collection('weatherables');
            const today = new Date().toISOString().split('T')[0];


            const lastDocument = await collection.find({ date: today })
                .sort({ dailyId: -1 })
                .limit(1)
                .toArray();

            let newDailyId = 1;

            if (lastDocument.length > 0) {
                newDailyId = lastDocument[0].dailyId + 1;
            }

            data.dailyId = newDailyId;
            data.date = today;

            await collection.insertOne(data);

            return new Response(JSON.stringify(data), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: "Invalid data" }), { status: 422 });
        }
    } catch (err) {
        console.log(err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
};
