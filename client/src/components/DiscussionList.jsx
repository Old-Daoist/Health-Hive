import CommentBox from "./CommentBox";

export default function DiscussionList({ posts, user, reload }) {
  return posts.map(p => (
    <div key={p._id} className="bg-white p-4 rounded mb-4">
      <h2 className="font-bold">{p.title}</h2>
      <p>{p.body}</p>

      <div className="flex gap-4 mt-2">
        <button onClick={async ()=>{
          await fetch(`http://localhost:5000/api/discussions/${p._id}/like`,{method:"POST"});
          reload();
        }}>👍 {p.likes}</button>
      </div>

      <CommentBox post={p} user={user} reload={reload} />
    </div>
  ));
}
