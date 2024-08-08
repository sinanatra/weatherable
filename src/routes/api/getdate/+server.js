import db from "$lib/db";
import { ObjectId } from "mongodb";

export const GET = async ({ request, url }) => {
    try {
        const dateParam = url.searchParams.get('date');
        if (!dateParam) {
            return new Response(JSON.stringify({ message: "Date parameter is required" }), { status: 400 });
        }

        const specificDate = new Date(dateParam);
        const startOfDay = new Date(specificDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(specificDate.setHours(23, 59, 59, 999));

        // Convert the start and end dates to ObjectIds
        const startObjectId = ObjectId.createFromTime(startOfDay.getTime() / 1000);
        const endObjectId = ObjectId.createFromTime(endOfDay.getTime() / 1000);

        const res = await db.collection('weatherables')
            .find({ _id: { $gte: startObjectId, $lt: endObjectId } })
            .sort({ _id: -1 })
            .toArray();

        return new Response(JSON.stringify(res), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }
};
