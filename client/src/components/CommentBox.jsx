import { useState } from "react";

export default function CommentBox({ post, user, reload }) {
  const [text, setText] = useState("");

  const send = async () => {
    await fetch(`http://localhost:5000/api/discussions/${post._id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        authorName: user.name,
        authorType: user.type
      })
    });
    setText("");
    reload();
  };

  return (
    <div className="mt-2">
      {post.comments.map((c,i)=>(
        <p key={i}><b>{c.authorName}</b>: {c.text}</p>
      ))}
      <input className="border p-1 w-full mt-1" placeholder="Reply..." value={text} onChange={e=>setText(e.target.value)} />
      <button onClick={send} className="text-sm text-blue-600">Reply</button>
    </div>
  );
}
