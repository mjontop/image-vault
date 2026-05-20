# Project Workflow & Architecture

## Encryption & Upload Sequence
- **Strict Phase Separation**: All files MUST be encrypted on the client or intermediate API before any uploads to storage begin.
- **Batching Strategy**: When performing batch uploads to storage providers (like GitLab), files must be sent in "Smart Dynamic Chunks".
    - Group files by total size (e.g., ~60MB raw data) rather than a fixed count to avoid memory/string limits.
    - Implement a cooldown delay (e.g., 1.5 seconds) between batch requests to respect provider rate limits (like GitLab's Commits API).

## Data Transmission
- **Prefer Binary over Base64**: Always use `multipart/form-data` and raw Blobs/Buffers for single file operations to avoid the 33% overhead of Base64 encoding.
- **GitLab Commits API**: Acknowledge that Base64 is required for this specific JSON-based API, but mitigate this by using the "Safe Batching" strategy described above.

## UI & Feedback
- **Specific Statuses**: Use granular statuses (`encrypting`, `uploading`, `completed`, `error-encrypt`, `error-upload`) to provide clear feedback on where a failure occurred.
- **Direct Error Display**: Display actual server error messages in the UI (e.g., via tooltips or overlays) instead of generic "Upload failed" messages.
