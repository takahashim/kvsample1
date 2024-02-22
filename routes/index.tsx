/// <reference lib="deno.unstable" />

import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
  comments: string[];
}

const setComment = async (title: string, content: string) => {
  const kv = await Deno.openKv();
  await kv.set(["comments", title], content);
}

const getComments = async () => {
  const kv = await Deno.openKv();
  const iter = await kv.list<string>({prefix: ["comments"]});
  const comments = [];
  for await (const entry of iter) {
    comments.push(`${entry.key}: ${entry.value}`); 
  }
  return comments;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const title = url.searchParams.get("title") || "-";
    const content = url.searchParams.get("content") || "---";
    await setComment(title, content);
    const comments = await getComments();

    return ctx.render({ comments });
  }
};

export default function Home({ data }: PageProps<Data>) {
  const { comments } = data;

  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
      </div>
      <div>
        <form>
          <label>title: <input type="text" name="title"  /></label>
          <label>content:<input type="text" name="content"  /></label>
          <button type="submit">Submit</button>
        </form>
        <ul>
          {comments.map((comment) => <li>{comment}</li>)}
        </ul>
      </div>
    </div>
  );
}
