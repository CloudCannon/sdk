# @cloudcannon/sdk

A TypeScript SDK for interacting with the CloudCannon REST API.

## Table of contents

- [Installation](#installation)
- [Creating and configuring the client](#creating-and-configuring-the-client)
  - [Optional configuration](#optional-configuration)
- [Client functions](#client-functions)
  - [Root client](#root-client)
  - [Organizations (`client.org(uuid)`)](#organizations-clientorguuid)
  - [Sites (`client.site(uuid)`)](#sites-clientsiteuuid)
  - [Inboxes (`client.inbox(uuid)`)](#inboxes-clientinboxuuid)
  - [Site Inboxes (`client.siteInbox(uuid)`)](#site-inboxes-clientsiteinboxuuid)
  - [Editing Sessions (`client.editingSession(uuid)`)](#editing-sessions-clienteditingsessionuuid)
  - [Editing Session Files (`client.editingSessionFile(uuid)`)](#editing-session-files-clienteditingsessionfileuuid)
  - [Builds (`client.build(uuid)`)](#builds-clientbuilduuid)
  - [Backups (`client.backup(uuid)`)](#backups-clientbackupuuid)
  - [Syncs (`client.sync(uuid)`)](#syncs-clientsyncuuid)
- [Pagination, sorting, and filtering](#pagination-sorting-and-filtering)
- [Error handling](#error-handling)
- [Advanced: using the raw `client.fetch`](#advanced-using-the-raw-clientfetch)

## Installation

```bash
npm install @cloudcannon/sdk
```

## Creating and configuring the client

Import `CloudCannonClient` and instantiate it with your API key or user access key:

```typescript
import CloudCannonClient from '@cloudcannon/sdk';

// Authenticate with an API key
const client = new CloudCannonClient({
  key: 'your-api-key-here',
});

// Authenticate with a user access key
const client = new CloudCannonClient({
  userAccessKey: {
    id: 'your-access-key-id',
    secret: 'your-access-key-secret',
  },
});
```

### Optional configuration

| Option | Type | Description |
|--------|------|-------------|
| `key` | `string` | Your CloudCannon API key. Required if `userAccessKey` is not provided. |
| `userAccessKey` | `{ id: string, secret: string }` | User access key for HMAC-SHA256 request signing. Required if `key` is not provided. |
| `apiOrigin` | `string` | The API host. Defaults to `app.cloudcannon.com`. |
| `getCustomAuthHeaders` | `() => Record<string, string>` | Provide custom authentication headers instead of the default auth headers. |

```typescript
// API key authentication
const client = new CloudCannonClient({
  key: 'your-api-key-here',
  apiOrigin: 'app.cloudcannon.com',
});

// User access key authentication
const client = new CloudCannonClient({
  userAccessKey: {
    id: 'your-access-key-id',
    secret: 'your-access-key-secret',
  },
  apiOrigin: 'app.cloudcannon.com',
});
```

## Client functions

The SDK exposes a hierarchy of sub-clients that map to CloudCannon's REST API resources. Each sub-client is accessed by calling a method on the root client with a UUID, or by calling top-level list methods directly on the root client.

### Root client

#### `client.orgs(options?)`

List all organizations you have access to. Supports pagination, sorting, and filtering.

```typescript
const { items, total_items } = await client.orgs({
  // Pagination, sorting, and filtering options
  page: 1,                 // Page number to fetch (1-indexed)
  items: 10,               // Number of items per page
  sort_attribute: 'name',  // Attribute to sort the results by (e.g. 'id', 'uuid', 'name', 'partner_points', 'updated_at')
  sort_direction: 'ASC',  // Sort direction: 'ASC' or 'DESC'
  filters: {
    // Optional filters
    search: 'acme',                    // Search term
    plan: 'pro',                       // Filter by plan name
    country: 'US',                     // Filter by country
    billing_status: 'active',          // Filter by billing status
    expired: false,                    // Filter by expired status
    locked: false,                     // Filter by locked status
    trial: false,                      // Filter by trial status
    hosting_limit_exceeded: false,     // Filter by hosting limit
    build_time_limit_exceeded: false,  // Filter by build time limit
    user_limit_exceeded: false,        // Filter by user limit
    domain_limit_exceeded: false,      // Filter by domain limit
    in_partner_program: false,         // Filter by partner program membership
    user_uuid: 'user-uuid',            // Filter by user UUID
    uuid: 'org-uuid',                  // Filter by organization UUID
    id: 123,                           // Filter by organization ID
    // Date range filters (ISO 8601 strings)
    created_at_lt: '2024-01-01T00:00:00Z',
    created_at_gt: '2023-01-01T00:00:00Z',
    created_at_lte: '2024-01-01T00:00:00Z',
    created_at_gte: '2023-01-01T00:00:00Z',
    updated_at_lt: '2024-01-01T00:00:00Z',
    updated_at_gt: '2023-01-01T00:00:00Z',
    updated_at_lte: '2024-01-01T00:00:00Z',
    updated_at_gte: '2023-01-01T00:00:00Z',
  },
});
// { // PaginatedResponse<Org>
//   items: [
//     { // Org
//       uuid: "STRING_VALUE",
//       id: 123,
//       name: "STRING_VALUE",
//       plan: "STRING_VALUE",
//       billing_status: "STRING_VALUE",
//       country: "STRING_VALUE",
//       created_at: "TIMESTAMP",
//       updated_at: "TIMESTAMP",
//     }
//   ],
//   current_page: 1,
//   total_items: 10,
//   total_pages: 1,
// }
```

#### `client.getUploadData()`

Fetch temporary S3 upload credentials used when uploading files through editing sessions.

```typescript
const uploadData = await client.getUploadData();
// { // UploadData
//   url: "STRING_VALUE",
//   prefix: "STRING_VALUE",
//   fields: {
//     "<key>": "STRING_VALUE",
//   },
// }
```

---

### Organizations (`client.org(uuid)`)

```typescript
const org = client.org('org-uuid');
```

#### `org.get()`

Get details for a single organization.

```typescript
const orgDetails = await org.get();
// { // Org
//   uuid: "STRING_VALUE",
//   id: 123,
//   name: "STRING_VALUE",
//   plan: "STRING_VALUE",
//   billing_status: "STRING_VALUE",
//   country: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `org.sites(options?)`

List all sites within the organization. Supports pagination, sorting, and filtering.

```typescript
const { items } = await org.sites({
  // Pagination, sorting, and filtering options
  page: 1,                           // Page number to fetch (1-indexed)
  items: 20,                         // Number of items per page
  sort_attribute: 'site_name',       // Attribute to sort by (e.g. 'id', 'uuid', 'site_name', 'domain_name', 'created_at', 'updated_at', 'last_synced', 'last_compiled', 'storage_provider', 'stable_domain', 'subpath', 'sync_error')
  sort_direction: 'DESC',           // Sort direction: 'ASC' or 'DESC'
  filters: {
    // Optional filters
    search: 'marketing',             // Search term
    site_name: 'My Site',            // Filter by site name
    domain_name: 'example.com',      // Filter by domain name
    stable_domain: 'my-site',        // Filter by stable domain
    ssg: 'hugo',                     // Filter by static site generator
    storage_provider: 'github',      // Filter by source provider
    output_storage_provider: 'github', // Filter by output provider
    hosting_choice: 'cloudcannon', // Filter by hosting choice
    authentication: 'password',      // Filter by authentication type
    force_ssl: true,                 // Filter by SSL enforcement
    editing_locked: false,           // Filter by editing lock status
    uploads_locked: false,           // Filter by uploads lock status
    browsing_locked: false,          // Filter by browsing lock status
    building_locked: false,          // Filter by building lock status
    uses_i18n: false,                // Filter by i18n usage
    sync_error: 'none',              // Filter by sync error status
    compile_error: 'none',           // Filter by compile error status
    project_uuid: 'project-uuid',    // Filter by project UUID
    base_domain_uuid: 'domain-uuid', // Filter by base domain UUID
    dam_uuid: 'dam-uuid',            // Filter by DAM UUID
    inbox_uuid: 'inbox-uuid',        // Filter by inbox UUID
    uuid: 'site-uuid',               // Filter by site UUID
    id: 123,                         // Filter by site ID
    // Date range filters
    created_at_lt: '2024-01-01T00:00:00Z',
    created_at_gt: '2023-01-01T00:00:00Z',
    created_at_lte: '2024-01-01T00:00:00Z',
    created_at_gte: '2023-01-01T00:00:00Z',
    updated_at_lt: '2024-01-01T00:00:00Z',
    updated_at_gt: '2023-01-01T00:00:00Z',
    updated_at_lte: '2024-01-01T00:00:00Z',
    updated_at_gte: '2023-01-01T00:00:00Z',
    last_synced: '2024-01-01T00:00:00Z',
    last_compiled: '2024-01-01T00:00:00Z',
  },
});
// { // PaginatedResponse<Site>
//   items: [
//     { // Site
//       uuid: "STRING_VALUE",
//       id: 123,
//       site_name: "STRING_VALUE",
//       stable_domain: "STRING_VALUE",
//       domain_name: "STRING_VALUE",
//       ssg: "STRING_VALUE",
//       storage_provider: "STRING_VALUE",
//       hosting_choice: "STRING_VALUE",
//       created_at: "TIMESTAMP",
//       updated_at: "TIMESTAMP",
//     }
//   ],
//   current_page: 1,
//   total_items: 10,
//   total_pages: 1,
// }
```

#### `org.createSite(name)`

Create a new site in the organization.

```typescript
const site = await org.createSite('My New Site');
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "My New Site",
//   stable_domain: "my-site",
//   domain_name: "STRING_VALUE",
//   ssg: "STRING_VALUE",
//   storage_provider: "STRING_VALUE",
//   hosting_choice: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `org.connectSite(name, providerDetails)`

Create a new site connected to a Git provider.

```typescript
const site = await org.connectSite(
  'My Site',
  {
    provider: 'github',       // Git provider (e.g. 'github', 'gitlab', 'bitbucket')
    repository: 'owner/repo', // Repository identifier (owner/name)
    branch: 'main',           // Branch to connect
    folder: 'src',            // Optional subfolder within the repository
  },
);
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "My Site",
//   stable_domain: "my-site",
//   storage_provider: "github",
//   domain_name: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `org.getInboxes(options?)`

List inboxes belonging to the organization. Supports pagination, sorting, and filtering.

```typescript
const { items } = await org.getInboxes({
  page: 1,
  items: 20,
  sort_attribute: 'name',   // Sort by 'created_at', 'updated_at', 'id', 'key', 'name', or 'uuid'
  sort_direction: 'ASC',
  filters: {
    search: 'contact',
    name: 'Contact Form',
    captcha_type: 'recaptcha',
    uuid: 'inbox-uuid',
    id: 123,
    // Date range filters
    created_at_lt: '2024-01-01T00:00:00Z',
    created_at_gt: '2023-01-01T00:00:00Z',
    created_at_lte: '2024-01-01T00:00:00Z',
    created_at_gte: '2023-01-01T00:00:00Z',
    updated_at_lt: '2024-01-01T00:00:00Z',
    updated_at_gt: '2023-01-01T00:00:00Z',
    updated_at_lte: '2024-01-01T00:00:00Z',
    updated_at_gte: '2023-01-01T00:00:00Z',
  },
});
// { // PaginatedResponse<Inbox>
//   items: [
//     { // Inbox
//       uuid: "STRING_VALUE",
//       id: 123,
//       name: "STRING_VALUE",
//       key: "STRING_VALUE",
//       monthly_quota: 1000,
//       created_at: "TIMESTAMP",
//       updated_at: "TIMESTAMP",
//     }
//   ],
//   current_page: 1,
//   total_items: 10,
//   total_pages: 1,
// }
```

#### `org.createInbox(body)`

Create a new inbox.

```typescript
const inbox = await org.createInbox({
  name: 'Contact Form',          // Display name for the inbox
  key: 'contact-form',           // Unique key/slug for the inbox
  monthly_quota: 1000,          // Optional monthly submission quota
  keep_form_hook_days: 30,      // Optional number of days to retain submissions
  captcha_key: 'site-key',      // Optional reCAPTCHA site key
  captcha_secret: 'secret',     // Optional reCAPTCHA secret key
  captcha_type: 'recaptcha',    // Optional captcha type
});
// { // Inbox
//   uuid: "STRING_VALUE",
//   id: 123,
//   name: "Contact Form",
//   key: "contact-form",
//   monthly_quota: 1000,
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `org.getDams(options?)`

List DAMs (Digital Asset Managers) connected to the organization. Supports pagination, sorting, and filtering.

```typescript
const { items } = await org.getDams({
  page: 1,
  items: 20,
  sort_attribute: 'name',   // Sort by 'id', 'uuid', 'name', 'type', or 'base_url'
  sort_direction: 'ASC',
  filters: {
    search: 'assets',
    name: 'My DAM',
    dam_type: 's3',              // Filter by DAM type (e.g. 's3', 'cloudinary', 'azure')
    uuid: 'dam-uuid',
    id: 123,
    unlinked_site_uuid: 'site-uuid', // Filter DAMs not linked to a specific site
    site_uuid: 'site-uuid',      // Filter DAMs linked to a specific site
    // Date range filters
    created_at_lt: '2024-01-01T00:00:00Z',
    created_at_gt: '2023-01-01T00:00:00Z',
    created_at_lte: '2024-01-01T00:00:00Z',
    created_at_gte: '2023-01-01T00:00:00Z',
    updated_at_lt: '2024-01-01T00:00:00Z',
    updated_at_gt: '2023-01-01T00:00:00Z',
    updated_at_lte: '2024-01-01T00:00:00Z',
    updated_at_gte: '2023-01-01T00:00:00Z',
  },
});
// { // PaginatedResponse<Dam>
//   items: [
//     { // Dam
//       uuid: "STRING_VALUE",
//       id: 123,
//       name: "STRING_VALUE",
//       dam_type: "s3",
//       base_url: "STRING_VALUE",
//       created_at: "TIMESTAMP",
//       updated_at: "TIMESTAMP",
//     }
//   ],
//   current_page: 1,
//   total_items: 10,
//   total_pages: 1,
// }
```

#### `org.createDam(body)`

Create a new DAM connection.

```typescript
const dam = await org.createDam({
  dam_type: 's3',              // DAM type: 's3', 'tenovos', 'cloudinary', 'azure', 'google', 'cloudflare', or 'digitalocean'
  name: 'My Asset Library',    // Display name for the DAM
  config: JSON.stringify({     // DAM-specific configuration as a JSON string
    bucket: 'my-bucket',
    region: 'us-east-1',
  }),
  base_url: 'https://cdn.example.com', // Base URL for assets
  access_key: 'access-key',    // Optional access key
  access_secret: 'secret',     // Optional access secret
  max_upload_size: 10485760,  // Optional maximum upload size in bytes
});
// { // Dam
//   uuid: "STRING_VALUE",
//   id: 123,
//   name: "My Asset Library",
//   dam_type: "s3",
//   base_url: "https://cdn.example.com",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `org.getRepositories(provider)`

List repositories available from a given provider (e.g. `github`, `gitlab`, `bitbucket`).

```typescript
const repos = await org.getRepositories('github');
// [ // RepositorySchema[]
//   {
//     full_name: "owner/repo",
//     name: "repo",
//     language: "typescript",
//     private: true,
//     avatar_url: "STRING_VALUE",
//     size: 123,
//     permissions: {
//       admin: true,
//       push: true,
//       pull: true,
//     },
//   }
// ]
```

---

### Sites (`client.site(uuid)`)

```typescript
const site = client.site('site-uuid');
```

#### `site.get()`

Get site details.

```typescript
const siteDetails = await site.get();
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "STRING_VALUE",
//   stable_domain: "STRING_VALUE",
//   domain_name: "STRING_VALUE",
//   ssg: "STRING_VALUE",
//   storage_provider: "STRING_VALUE",
//   hosting_choice: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.update(body)`

Update site settings.

```typescript
const updatedSite = await site.update({
  site_name: 'Updated Site Name',     // New display name for the site
  editing_locked: false,              // Whether editing is locked
  active_quest: 'onboarding',         // Optional active quest/flow identifier
  cloudcannon_config_path: '/cloudcannon.config.yml', // Optional path to CloudCannon config file
  flags: {                           // Optional site flags/settings object
    custom_flag: true,
  },
});
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "Updated Site Name",
//   stable_domain: "STRING_VALUE",
//   domain_name: "STRING_VALUE",
//   ssg: "STRING_VALUE",
//   storage_provider: "STRING_VALUE",
//   hosting_choice: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.delete()`

Delete the site.

```typescript
await site.delete();
// Returns: void
```

#### `site.copy(body)`

Copy the site to a new site.

```typescript
const newSite = await site.copy({
  site_name: 'Copy of My Site',      // Name for the new copied site
  editing_locked: false,            // Whether the new site should have editing locked
  active_quest: null,               // Optional active quest for the new site
  cloudcannon_config_path: null,    // Optional config path for the new site
  flags: {},                        // Optional flags for the new site
  publish_mode: null,               // Optional publish mode
  destroy_on_publish: false,        // Whether to destroy the site on publish
});
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "Copy of My Site",
//   stable_domain: "copy-of-my-site",
//   domain_name: "STRING_VALUE",
//   ssg: "STRING_VALUE",
//   storage_provider: "STRING_VALUE",
//   hosting_choice: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.updateBuildConfig(options)`

Update the build configuration for the site.

```typescript
await site.updateBuildConfig({
  default_locale: 'en',              // Optional default locale for i18n
  uses_i18n: true,                  // Whether the site uses internationalization
  building_locked: false,            // Whether building is locked
  ssg: 'hugo',                      // Optional static site generator identifier
  compile: {
    install_command: 'npm install', // Command to run before building
    build_command: 'hugo',           // Build command
    output_path: 'public',           // Output directory for built files
    environment_variables: [         // Optional environment variables
      { key: 'HUGO_VERSION', value: '0.120.0' },
    ],
    hugoVersion: '0.120.0',          // Optional Hugo version
    denoVersion: '1.38.0',           // Optional Deno version
    rubyVersion: '3.2.0',            // Optional Ruby version
    nodeVersion: '20.0.0',           // Optional Node.js version
    preserved_paths: 'node_modules,dist/images', // Paths to preserve between builds (comma separated string)
    preserveOutput: true,            // Whether to preserve previous output
    includeGit: false,              // Whether to include Git history in build
    manually_configure_urls: false, // Whether to manually configure URLs
  },
});
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "STRING_VALUE",
//   stable_domain: "STRING_VALUE",
//   ssg: "hugo",
//   storage_provider: "STRING_VALUE",
//   hosting_choice: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.getBuilds(options?)`

List all builds for the site. Supports pagination, sorting, and filtering.

```typescript
const { items } = await site.getBuilds({
  page: 1,
  items: 20,
  sort_attribute: 'created_at',    // Sort by 'id', 'uuid', or 'created_at'
  sort_direction: 'DESC',
  filters: {
    search: 'build-123',
    name: 'Production Build',
    successful: true,              // Filter by build success status
    pinnable: true,                // Filter by pinnable builds
    site_uuid: 'site-uuid',
    uuid: 'build-uuid',
    id: 123,
    completed_at: '2024-01-01T00:00:00Z',
    // Date range filters
    created_at_lt: '2024-01-01T00:00:00Z',
    created_at_gt: '2023-01-01T00:00:00Z',
    created_at_lte: '2024-01-01T00:00:00Z',
    created_at_gte: '2023-01-01T00:00:00Z',
    updated_at_lt: '2024-01-01T00:00:00Z',
    updated_at_gt: '2023-01-01T00:00:00Z',
    updated_at_lte: '2024-01-01T00:00:00Z',
    updated_at_gte: '2023-01-01T00:00:00Z',
  },
});
// { // PaginatedResponse<Build>
//   items: [
//     { // Build
//       uuid: "STRING_VALUE",
//       id: 123,
//       name: "STRING_VALUE",
//       site_id: 123,
//       successful: true,
//       completed_at: "TIMESTAMP",
//       created_at: "TIMESTAMP",
//       updated_at: "TIMESTAMP",
//     }
//   ],
//   current_page: 1,
//   total_items: 10,
//   total_pages: 1,
// }
```

#### `site.rebuild()`

Trigger a new build.

```typescript
await site.rebuild();
// Returns: void
```

#### `site.listBackups(options?)`

List backups/archives for the site. Supports pagination, sorting, and filtering.

```typescript
const { items } = await site.listBackups({
  page: 1,
  items: 20,
  sort_attribute: 'created_at',    // Sort by 'id', 'uuid', or 'created_at'
  sort_direction: 'DESC',
  filters: {
    search: 'backup-123',
    uuid: 'backup-uuid',
    id: 123,
    size_gte: 1024,                // Minimum backup size in bytes
    size_lt: 104857600,            // Maximum backup size (less than)
    size_gt: 1024,                 // Minimum backup size (greater than)
    size_lte: 104857600,           // Maximum backup size (less than or equal)
    // Date range filters
    created_at_lt: '2024-01-01T00:00:00Z',
    created_at_gt: '2023-01-01T00:00:00Z',
    created_at_lte: '2024-01-01T00:00:00Z',
    created_at_gte: '2023-01-01T00:00:00Z',
    updated_at_lt: '2024-01-01T00:00:00Z',
    updated_at_gt: '2023-01-01T00:00:00Z',
    updated_at_lte: '2024-01-01T00:00:00Z',
    updated_at_gte: '2023-01-01T00:00:00Z',
  },
});
// { // PaginatedResponse<Backup>
//   items: [
//     { // SiteArchive
//       uuid: "STRING_VALUE",
//       id: 123,
//       path: "STRING_VALUE",
//       size: 123,
//       created_at: "TIMESTAMP",
//       updated_at: "TIMESTAMP",
//     }
//   ],
//   current_page: 1,
//   total_items: 10,
//   total_pages: 1,
// }
```

#### `site.createBackup(body?)`

Create a new backup. Returns an optional `socket_message_id` for real-time progress updates.

```typescript
const result = await site.createBackup({
  exclude_git: false,              // Whether to exclude Git history from the backup
});
// { // { socket_message_id?: string }
//   socket_message_id: "STRING_VALUE",
// }
```

#### `site.listFiles()`

List files in the site's repository.

```typescript
const files = await site.listFiles();
// [ // FileListing[]
//   {
//     md5: "STRING_VALUE",
//     s3Path: "STRING_VALUE",
//     sitePath: "STRING_VALUE",
//   }
// ]
```

#### `site.getFile(path)`

Fetch a raw file from the site's repository. Returns a `Response` object.

```typescript
const resp = await site.getFile('README.md');
const text = await resp.text();
// Returns: Response — raw fetch Response for the requested file
```

#### `site.getSyncs(options?)`

List syncs for the site. Supports pagination, sorting, and filtering.

```typescript
const { items } = await site.getSyncs({
  page: 1,
  items: 20,
  sort_attribute: 'created_at',    // Sort by 'id', 'uuid', or 'created_at'
  sort_direction: 'DESC',
  filters: {
    search: 'sync-123',
    name: 'Main Sync',
    successful: true,              // Filter by sync success status
    provider: 'github',            // Filter by provider
    identifier: 'main-branch',   // Filter by sync identifier
    after_identifier: 'prev-id', // Filter by after identifier
    diff_id: 'diff-123',           // Filter by diff ID
    site_uuid: 'site-uuid',
    uuid: 'sync-uuid',
    id: 123,
    completed_at: '2024-01-01T00:00:00Z',
    // Date range filters
    created_at_lt: '2024-01-01T00:00:00Z',
    created_at_gt: '2023-01-01T00:00:00Z',
    created_at_lte: '2024-01-01T00:00:00Z',
    created_at_gte: '2023-01-01T00:00:00Z',
    updated_at_lt: '2024-01-01T00:00:00Z',
    updated_at_gt: '2023-01-01T00:00:00Z',
    updated_at_lte: '2024-01-01T00:00:00Z',
    updated_at_gte: '2023-01-01T00:00:00Z',
  },
});
// { // PaginatedResponse<Sync>
//   items: [
//     { // Sync
//       uuid: "STRING_VALUE",
//       id: 123,
//       name: "STRING_VALUE",
//       successful: true,
//       provider: "github",
//       identifier: "main-branch",
//       created_at: "TIMESTAMP",
//       updated_at: "TIMESTAMP",
//     }
//   ],
//   current_page: 1,
//   total_items: 10,
//   total_pages: 1,
// }
```

#### `site.getScan()`

Get the latest site scan results.

```typescript
const scan = await site.getScan();
// { // SiteScanner
//   uuid: "STRING_VALUE",
//   id: 123,
//   files: 123,
//   html_files: 123,
//   css_files: 123,
//   image_files: 123,
//   js_files: 123,
//   blog_posts: 123,
//   data_files: 123,
//   layouts: 123,
//   total_size: 123,
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.getScreenshotHashes()`

Get MD5 hashes for site screenshots.

```typescript
const hashes = await site.getScreenshotHashes();
// { // Record<string, string>
//   "desktop": "d41d8cd98f00b204e9800998ecf8427e",
//   "mobile": "d41d8cd98f00b204e9800998ecf8427e",
// }
```

#### `site.getScreenshot(device, path)`

Fetch a screenshot for a specific path and device (`desktop` or `mobile`). Returns a `Response` object.

```typescript
const screenshot = await site.getScreenshot('desktop', '/about');
// Returns: Response — raw image fetch Response
```

#### `site.connectSourceProvider(options)`

Connect a Git repository as the source provider.

```typescript
await site.connectSourceProvider({
  provider: 'github',       // Git provider (e.g. 'github', 'gitlab', 'bitbucket')
  repository: 'owner/repo', // Repository identifier (owner/name)
  branch: 'main',           // Branch to connect
});
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "STRING_VALUE",
//   stable_domain: "STRING_VALUE",
//   storage_provider: "github",
//   domain_name: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.updateSourceProvider(options)`

Update the connected source provider's branch or repository.

```typescript
await site.updateSourceProvider({
  repository: 'owner/new-repo', // Updated repository identifier
  branch: 'develop',           // Updated branch name
});
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "STRING_VALUE",
//   stable_domain: "STRING_VALUE",
//   storage_provider: "github",
//   domain_name: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.disconnectSourceProvider()`

Remove the source provider connection.

```typescript
const updatedSite = await site.disconnectSourceProvider();
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "STRING_VALUE",
//   stable_domain: "STRING_VALUE",
//   storage_provider: null,
//   domain_name: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.connectOutputProvider(options)`

Connect a Git repository as the output (built site) provider.

```typescript
await site.connectOutputProvider({
  provider: 'github',       // Git provider
  repository: 'owner/output', // Output repository identifier
  branch: 'gh-pages',       // Output branch
});
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "STRING_VALUE",
//   stable_domain: "STRING_VALUE",
//   output_storage_provider: "github",
//   domain_name: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.disconnectOutputProvider()`

Remove the output provider connection.

```typescript
const updatedSite = await site.disconnectOutputProvider();
// { // Site
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_name: "STRING_VALUE",
//   stable_domain: "STRING_VALUE",
//   output_storage_provider: null,
//   domain_name: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.getInboxConnections()`

Get inboxes connected to this site.

```typescript
const inboxes = await site.getInboxConnections();
// [ // SiteInbox
//   {
//     uuid: "STRING_VALUE",
//     id: 123,
//     inbox_uuid: "STRING_VALUE",
//     default_inbox: true,
//     visible: true,
//     require_captcha: true,
//     created_at: "TIMESTAMP",
//     updated_at: "TIMESTAMP",
//   }
// ]
```

#### `site.connectInbox(body)`

Connect an inbox to this site.

```typescript
const siteInbox = await site.connectInbox({
  inbox_uuid: 'inbox-uuid',       // UUID of the inbox to connect
  default_inbox: true,            // Whether this is the default inbox for the site
  visible: true,                  // Whether the inbox is visible
  require_captcha: true,          // Whether to require captcha for submissions
});
// { // SiteInbox
//   uuid: "STRING_VALUE",
//   id: 123,
//   inbox_uuid: "inbox-uuid",
//   default_inbox: true,
//   visible: true,
//   require_captcha: true,
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.getDamConnections()`

Get DAMs connected to this site.

```typescript
const dams = await site.getDamConnections();
// [ // SiteDam
//   {
//     uuid: "STRING_VALUE",
//     id: 123,
//     dam_uuid: "STRING_VALUE",
//     uploads_locked: false,
//     reference_key: "STRING_VALUE",
//     created_at: "TIMESTAMP",
//     updated_at: "TIMESTAMP",
//   }
// ]
```

#### `site.connectDam(body)`

Connect a DAM to this site.

```typescript
const siteDam = await site.connectDam({
  dam_uuid: 'dam-uuid',           // UUID of the DAM to connect
  uploads_locked: false,          // Whether uploads to the DAM are locked
  config: {                      // Optional DAM-specific configuration
    folder: 'site-assets',
  },
  reference_key: 'main-assets',   // Optional reference key
});
// { // SiteDam
//   uuid: "STRING_VALUE",
//   id: 123,
//   dam_uuid: "dam-uuid",
//   uploads_locked: false,
//   reference_key: "main-assets",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.getEditingSessions()`

List editing sessions for the site.

```typescript
const sessions = await site.getEditingSessions();
// [ // EditingSession
//   {
//     uuid: "STRING_VALUE",
//     id: 123,
//     site_id: 123,
//     state: "STRING_VALUE",
//     base_commit_hash: "STRING_VALUE",
//     created_at: "TIMESTAMP",
//     updated_at: "TIMESTAMP",
//   }
// ]
```

#### `site.createEditingSession()`

Create a new editing session.

```typescript
const session = await site.createEditingSession();
// { // EditingSession
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_id: 123,
//   state: "STRING_VALUE",
//   base_commit_hash: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.getLatestEditingSession()`

Get the most recent editing session.

```typescript
const latestSession = await site.getLatestEditingSession();
// { // EditingSession
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_id: 123,
//   state: "STRING_VALUE",
//   base_commit_hash: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `site.uploadFile(path, content, options?)`

Upload a file to the site through an editing session. Content is uploaded to S3 and committed through the editing session workflow.

```typescript
await site.uploadFile(
  'content/posts/hello.md',       // Path in the site's repository
  '# Hello World',                // File content (string, Blob, ArrayBuffer, etc.)
  {
    type: 'text/markdown',        // Optional MIME type (defaults to 'text/plain')
    allow_overwrite: true, // Whether to overwrite if the file already exists
  }
);
// Returns: void
```

#### `site.triggerPull()`

Manually trigger a pull from the source provider.

```typescript
await site.triggerPull();
// Returns: void
```

---

### Inboxes (`client.inbox(uuid)`)

```typescript
const inbox = client.inbox('inbox-uuid');
```

#### `inbox.getSubmissions(options?)`

List form submissions for the inbox. Supports pagination, sorting, and filtering.

```typescript
const { items } = await inbox.getSubmissions({
  page: 1,
  items: 20,
  sort_attribute: 'last_sent_at',  // Sort by 'last_sent_at', 'created_at', 'id', or 'uuid'
  sort_direction: 'DESC',
  filters: {
    category: 'pending',         // Filter by status: 'spam', 'sent', 'errored', or 'pending'
    search: 'john@example.com',
    sent: true,                   // Filter by sent status
    spam_checked: true,           // Filter by spam checked status
    automatically_marked_spam: false, // Filter by auto-marked spam
    explicitly_marked_status: 0, // Filter by explicit status
    has_error: false,             // Filter by error presence
    has_spam_check_error: false, // Filter by spam check error
    ip: '192.168.1.1',          // Filter by IP address
    host: 'example.com',        // Filter by host
    inbox_uuid: 'inbox-uuid',
    site_uuid: 'site-uuid',
    uuid: 'submission-uuid',
    id: 123,
    // Date range filters for cleared_at
    cleared_at_lt: '2024-01-01T00:00:00Z',
    cleared_at_gt: '2023-01-01T00:00:00Z',
    cleared_at_lte: '2024-01-01T00:00:00Z',
    cleared_at_gte: '2023-01-01T00:00:00Z',
    // Date range filters for last_sent_at
    last_sent_at_lt: '2024-01-01T00:00:00Z',
    last_sent_at_gt: '2023-01-01T00:00:00Z',
    last_sent_at_lte: '2024-01-01T00:00:00Z',
    last_sent_at_gte: '2023-01-01T00:00:00Z',
    // Count filters
    sent_count_lt: 5,
    sent_count_gt: 0,
    sent_count_lte: 10,
    sent_count_gte: 1,
    // Standard date range filters
    created_at_lt: '2024-01-01T00:00:00Z',
    created_at_gt: '2023-01-01T00:00:00Z',
    created_at_lte: '2024-01-01T00:00:00Z',
    created_at_gte: '2023-01-01T00:00:00Z',
    updated_at_lt: '2024-01-01T00:00:00Z',
    updated_at_gt: '2023-01-01T00:00:00Z',
    updated_at_lte: '2024-01-01T00:00:00Z',
    updated_at_gte: '2023-01-01T00:00:00Z',
  },
});
// { // PaginatedResponse<FormSubmission>
//   items: [
//     { // FormHook
//       uuid: "STRING_VALUE",
//       id: 123,
//       sent: true,
//       ip: "STRING_VALUE",
//       host: "STRING_VALUE",
//       data: {},
//       created_at: "TIMESTAMP",
//       updated_at: "TIMESTAMP",
//     }
//   ],
//   current_page: 1,
//   total_items: 10,
//   total_pages: 1,
// }
```

---

### Site Inboxes (`client.siteInbox(uuid)`)

```typescript
const siteInbox = client.siteInbox('site-inbox-uuid');
```

#### `siteInbox.update(body)`

Update a site-inbox connection.

```typescript
const updated = await siteInbox.update({
  inbox_uuid: 'inbox-uuid',       // UUID of the inbox to link
  default_inbox: true,            // Whether this is the default inbox for the site
  visible: true,                  // Whether the inbox is visible on the site
  require_captcha: true,          // Whether to require captcha for form submissions
});
// { // SiteInbox
//   uuid: "STRING_VALUE",
//   id: 123,
//   inbox_uuid: "inbox-uuid",
//   default_inbox: true,
//   visible: true,
//   require_captcha: true,
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

---

### Editing Sessions (`client.editingSession(uuid)`)

```typescript
const session = client.editingSession('session-uuid');
```

#### `session.get()`

Get editing session details.

```typescript
const sessionDetails = await session.get();
// { // EditingSession
//   uuid: "STRING_VALUE",
//   id: 123,
//   site_id: 123,
//   state: "STRING_VALUE",
//   base_commit_hash: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `session.getFiles()`

List files in the editing session.

```typescript
const files = await session.getFiles();
// [ // EditingSessionFile
//   {
//     uuid: "STRING_VALUE",
//     id: 123,
//     editing_session_uuid: "STRING_VALUE",
//     path: "STRING_VALUE",
//     source_path: "STRING_VALUE",
//     edit_type: "STRING_VALUE",
//     created_at: "TIMESTAMP",
//     updated_at: "TIMESTAMP",
//   }
// ]
```

#### `session.createFile(body)`

Create a new file in the editing session.

```typescript
const file = await session.createFile({
  edit_type: 'update',            // Type of edit: 'update', 'delete'.
  path: 'content/new-post.md',    // Target path for the file
  source_path: 'content/draft.md', // Optional source path (for move/copy operations)
  discard_unsaved: false,         // Whether to discard any unsaved changes
  previous_content_hash: 'abc123', // Optional hash of the previous content
  metadata: {                     // Optional metadata object
    title: 'New Post',
  },
});
// { // EditingSessionFile
//   uuid: "STRING_VALUE",
//   id: 123,
//   editing_session_uuid: "STRING_VALUE",
//   path: "content/new-post.md",
//   edit_type: "create",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `session.moveFile(options)`

Move (rename) a single file within the editing session. The session file's `source_path` is preserved and a delete entry is created for the original location on commit.

```typescript
const files = await session.moveFile({
  source: 'content/old-post.md',  // Path to move from
  target: 'content/new-post.md', // Path to move to
  allow_overwrite: false,        // Optional: allow overwriting an existing file
});
// [ // EditingSessionFile[]
//   { uuid: "STRING_VALUE", edit_type: "update", path: "content/new-post.md", ... },
// ]
```

#### `session.moveFiles(options)`

Move multiple files within the editing session in a single request.

```typescript
const files = await session.moveFiles({
  paths: [
    { source: 'content/old-post.md', target: 'content/new-post.md' },
    { source: 'content/draft.md', target: 'content/published.md' },
  ],
  allow_overwrite: true,         // Optional: applied to all paths
});
// [ // EditingSessionFile[] ]
```

#### `session.cloneFile(options)`

Clone a single file to a new path within the editing session. The source file is left unchanged.

```typescript
const files = await session.cloneFile({
  source: 'content/post.md',     // Path to clone from
  target: 'content/post-copy.md', // Path to clone to
  allow_overwrite: false,        // Optional: allow overwriting an existing file
});
// [ // EditingSessionFile[] ]
```

#### `session.cloneFiles(options)`

Clone multiple files within the editing session in a single request.

```typescript
const files = await session.cloneFiles({
  paths: [
    { source: 'content/post.md', target: 'content/post-copy.md' },
    { source: 'assets/logo.png', target: 'assets/logo-backup.png' },
  ],
  allow_overwrite: true,         // Optional: applied to all paths
});
// [ // EditingSessionFile[] ]
```

#### `session.deleteFile(options)`

Mark a single file for deletion within the editing session. The file is removed from the repository on commit.

```typescript
const files = await session.deleteFile({
  target: 'content/old-post.md', // Path to delete
  discard_unsaved: false,        // Optional: discard unsaved edits to the file
});
// [ // EditingSessionFile[] ]
```

#### `session.deleteFiles(options)`

Mark multiple files for deletion within the editing session in a single request.

```typescript
const files = await session.deleteFiles({
  paths: [
    { target: 'content/old-post.md' },
    { target: 'content/draft.md' },
  ],
  discard_unsaved: true,         // Optional: applied to all paths
});
// [ // EditingSessionFile[] ]
```

#### `session.restoreFile(options)`

Restore a previously deleted file within the editing session, removing the pending delete entry.

```typescript
const files = await session.restoreFile({
  target: 'content/old-post.md', // Path to restore
});
// [ // EditingSessionFile[] ]
```

#### `session.restoreFiles(options)`

Restore multiple previously deleted files within the editing session in a single request.

```typescript
const files = await session.restoreFiles({
  paths: [
    { target: 'content/old-post.md' },
    { target: 'content/draft.md' },
  ],
});
// [ // EditingSessionFile[] ]
```

#### `session.commit()`

Commit the editing session, pushing changes to the connected repository.

```typescript
const result = await session.commit();
// { // CommitEditingSessionResponse
//   socket_message_id: "STRING_VALUE",
// }
```

---

### Editing Session Files (`client.editingSessionFile(uuid)`)

```typescript
const file = client.editingSessionFile('file-uuid');
```

#### `file.get()`

Get details for an editing session file.

```typescript
const fileDetails = await file.get();
// { // EditingSessionFile
//   uuid: "STRING_VALUE",
//   id: 123,
//   editing_session_uuid: "STRING_VALUE",
//   path: "STRING_VALUE",
//   source_path: "STRING_VALUE",
//   edit_type: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `file.getContributions()`

List contributions (versions) for the file.

```typescript
const contributions = await file.getContributions();
// [ // EditingSessionFileContribution
//   {
//     uuid: "STRING_VALUE",
//     id: 123,
//     editing_session_file_uuid: "STRING_VALUE",
//     session_uuid: "STRING_VALUE",
//     state: "STRING_VALUE",
//     file_contents: "STRING_VALUE",
//     content_hash: "STRING_VALUE",
//     created_at: "TIMESTAMP",
//     updated_at: "TIMESTAMP",
//   }
// ]
```

#### `file.createContribution(body)`

Create a new contribution for the file.

```typescript
const contribution = await file.createContribution({
  s3_key: 'uploads/12345/content.md', // S3 key where the file content is stored
  content_hash: 'd41d8cd98f00b204e9800998ecf8427e', // MD5 hash of the new content
  previous_content_hash: 'abc123def456', // Optional hash of the previous content for conflict detection
});
// { // EditingSessionFileContribution
//   uuid: "STRING_VALUE",
//   id: 123,
//   editing_session_file_uuid: "STRING_VALUE",
//   session_uuid: "STRING_VALUE",
//   state: "STRING_VALUE",
//   file_contents: "STRING_VALUE",
//   content_hash: "d41d8cd98f00b204e9800998ecf8427e",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `file.unlock(body)`

Unlock the file so other users can edit it.

```typescript
const contribution = await file.unlock({
  previous_content_hash: 'd41d8cd98f00b204e9800998ecf8427e', // Expected current content hash
});
// { // EditingSessionFileContribution
//   uuid: "STRING_VALUE",
//   id: 123,
//   editing_session_file_uuid: "STRING_VALUE",
//   session_uuid: "STRING_VALUE",
//   state: "STRING_VALUE",
//   file_contents: "STRING_VALUE",
//   content_hash: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

#### `file.discard()`

Discard the editing session file, removing it from the editing session.

```typescript
const contribution = await file.discard();
// { }
```

---

### Builds (`client.build(uuid)`)

```typescript
const build = client.build('build-uuid');
```

#### `build.get()`

Get build details. Returns a `Response` object.

```typescript
const resp = await build.get();
const buildData = await resp.json();
// { // Build
//   uuid: "STRING_VALUE",
//   id: 123,
//   name: "STRING_VALUE",
//   site_id: 123,
//   successful: true,
//   completed_at: "TIMESTAMP",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

---

### Backups (`client.backup(uuid)`)

```typescript
const backup = client.backup('backup-uuid');
```

#### `backup.download()`

Download a backup archive. Returns a `Response` object.

```typescript
const resp = await backup.download();
// Returns: Response — raw binary fetch Response (consume the body stream)
```

---

### Syncs (`client.sync(uuid)`)

```typescript
const sync = client.sync('sync-uuid');
```

#### `sync.get()`

Get sync details. Returns a `Response` object.

```typescript
const resp = await sync.get();
const syncData = await resp.json();
// { // Sync
//   uuid: "STRING_VALUE",
//   id: 123,
//   name: "STRING_VALUE",
//   successful: true,
//   provider: "github",
//   identifier: "STRING_VALUE",
//   created_at: "TIMESTAMP",
//   updated_at: "TIMESTAMP",
// }
```

---

## Pagination, sorting, and filtering

Many list methods support pagination, sorting, and filtering through a common options shape. The examples above show the available options for each endpoint. In general:

- `page` and `items` control pagination.
- `sort_attribute` and `sort_direction` control ordering.
- `filters` is an object of endpoint-specific query parameters.

Responses from paginated endpoints return:

```typescript
{
  items: T[];           // Array of results for the current page
  current_page?: number; // Current page number
  total_items?: number; // Total number of items across all pages
  total_pages?: number; // Total number of pages available
}
```

---

## Error handling

The SDK throws typed errors that all extend `ApiError`, so you can check the status code or use `instanceof`:

- `ForbiddenError` for HTTP 403 (permission denied)
- `NotFoundError` for HTTP 404 (not found)
- `ApiError` for HTTP 402 or HTTP 422 (the latter includes the full validation messages, the request URL, and the original status code)

```typescript
import { ApiError, ForbiddenError, NotFoundError } from '@cloudcannon/sdk';

try {
  await site.update({ site_name: '' });
} catch (err) {
  if (err instanceof ForbiddenError) {
    console.error(err.status);   // 403
    console.error(err.url);      // The endpoint that failed
  } else if (err instanceof NotFoundError) {
    console.error(err.status);   // 404
  } else if (err instanceof ApiError) {
    console.error(err.status);   // 402 or 422
    console.error(err.errors);   // Detailed validation errors from the API
  }
}
```

---

## Advanced: using the raw `client.fetch`

The root client exposes a strongly-typed `fetch` method that you can use to call any CloudCannon API endpoint directly. The URL and request body are typed against the OpenAPI schema, so TypeScript will autocomplete valid paths and validate request shapes.

```typescript
// GET request to an arbitrary endpoint
const resp = await client.fetch('/orgs/my-org', {
  method: 'GET',
});
const org = await resp.json();
```

```typescript
// POST with a typed request body
const resp = await client.fetch('/orgs/my-org/sites', {
  method: 'POST',
  body: {
    site_name: 'My New Site',
  },
});
const site = await resp.json();
```

`fetch` automatically injects your authentication headers and sets `Content-Type: application/json`. It returns a typed response object keyed by HTTP status codes, so you can handle success and error cases with full type safety.

```typescript
const resp = await client.fetch('/sites/site-uuid');

if (resp.status === 200) {
  const site = await resp.json();
} else if (resp.status === 404) {
  // Handle not found
}
```

This is useful when you need to access endpoints that are not yet covered by the high-level sub-clients, or when you need full control over headers and fetch options.
