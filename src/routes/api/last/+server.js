import db from "$lib/db";

export const GET = async ({ request, url }) => {
    try {
        const res = await db.collection('weatherables')
            .find()
            .sort({ _id: -1 })
            .limit(1)
            .toArray()

        return new Response(JSON.stringify(res), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
};
