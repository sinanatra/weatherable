import db from "$lib/db";

export const POST = async ({ request }) => {
    try {
        const data = await request.json();

        if (data.answer) {
            const collection = await db.collection('weatherables');
            const today = new Date().toISOString().split('T')[0];
            // const countResult = await collection.countDocuments({ date: today });
            const countResult =  await collection.countDocuments();

            data.dailyId = countResult + 1;
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
