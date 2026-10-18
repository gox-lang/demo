import { useState } from "react";
import Actions from "@gox/actions";

export default function ProfileSearch() {
    const [profile, setProfile] = useState(null);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    async function submit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        setPending(true);
        setError("");
        setProfile(null);
        try {
            const [result, err] = await Actions.PreviewProfile(form);
            if (err) throw new Error(err.message);
            setProfile(result);
        } catch (err) {
            setError(err.message || "Could not connect.");
        } finally {
            setPending(false);
        }
    }

    return (
        <div>
            <form onSubmit={submit}>
                <label htmlFor="profile-name">Name</label>
                <input
                    id="profile-name"
                    name="name"
                    type="text"
                    defaultValue="George"
                    maxLength={60}
                    required
                />
                <label htmlFor="profile-age">Age</label>
                <input
                    id="profile-age"
                    name="age"
                    type="number"
                    defaultValue={30}
                    min={1}
                    max={120}
                    required
                />
                <label className="profile-checkbox">
                    <input name="active" type="checkbox" defaultChecked />
                    Active profile
                </label>
                <button
                    className="button primary"
                    type="submit"
                    disabled={pending}
                >
                    {pending ? "Sending…" : "Submit form →"}
                </button>
            </form>
            <p className="http-status" role="status">
                {error ||
                    (pending
                        ? "Processing in Go…"
                        : "GOX matches controls by name and converts their values.")}
            </p>
            <div className="http-result" aria-live="polite">
                {profile ? (
                    <article>
                        <div className="avatar">G</div>
                        <h3>{profile.Name}</h3>
                        <p>Age: {profile.Age}</p>
                        <p>Active: {profile.Active ? "Yes" : "No"}</p>
                    </article>
                ) : (
                    "Your profile will appear here."
                )}
            </div>
        </div>
    );
}
