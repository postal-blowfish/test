// apiGet.mjs
export default async function apiGet(target) {
	const res = await fetch(target);

    return await res.json();
}