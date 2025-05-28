# Admin Documentation

This documentation provides an overview of the routes defined in adminRoute.js, including their purpose, request structure, expected responses, and error possibilities.

## Table of Contents

- [Authentication Routes](#authentication-routes)
- [Vision Feed Routes](#vision-feed-routes)
- [Avatar Upload Routes](#avatar-upload-routes)
- [User Management Routes](#user-management-routes)
- [Page Management Routes](#page-management-routes)
- [Page Post Routes](#page-post-routes)
- [InfoCard Routes](#infocard-routes)

---

## Authentication Routes

### POST /login

**Description:** Authenticates an admin and returns a JWT token.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

## Vision Feed Routes

### POST /feed

**Description:** Creates a new post with optional media uploads.

**Request Body:**

```json
{
  "description": "Post description",
  "platform": "Platform name",
  "usernameOrName": "Username",
  "location": "Location",
  "categories": "Category1",
  "subCategories": ["SubCategory1"]
}
```

**Response:**

```json
{
  "_id": "post-id",
  "mediaUrl": "path/to/media",
  "description": "Post description",
  "platform": "Platform name",
  "usernameOrName": "Username",
  "location": "Location",
  "categories": "Category1",
  "subCategories": ["SubCategory1"]
}
```

**Errors:**

- 400 Bad Request: Missing required fields.
- 500 Internal Server Error: Error creating the post.

### PUT /feed/:id

**Description:** Updates an existing post by ID.

**Request Body:**

```json
{
  "description": "Updated description",
  "platform": "Updated platform",
  "usernameOrName": "Updated username",
  "location": "Updated location",
  "categories": "UpdatedCategory1",
  "subCategories": ["UpdatedSubCategory1"]
}
```

**Response:**

```json
{
  "_id": "post-id",
  "mediaUrl": "path/to/media",
  "description": "Updated description",
  "platform": "Updated platform",
  "usernameOrName": "Updated username",
  "location": "Updated location",
  "categories": "UpdatedCategory1",
  "subCategories": ["UpdatedSubCategory1"]
}
```

**Errors:**

- 404 Not Found: Post not found.
- 500 Internal Server Error: Error updating the post.

### DELETE /feed/:id

**Description:** Deletes a post by ID.

**Response:**

```json
{
  "message": "Post deleted successfully"
}
```

**Errors:**

- 404 Not Found: Post not found.
- 500 Internal Server Error: Error deleting the post.

---

## Page Management Routes

### GET /get-all-pages

**Description:** Fetches all pages.

**Response:**

```json
[
  {
    "_id": "page-id",
    "title": "Page Title",
    "description": "Page Description"
  }
]
```

**Errors:**

- 404 Not Found: No pages found.
- 500 Internal Server Error: Error fetching pages.

### GET /get-page-details/:id

**Description:** Fetches details of a specific page by ID.

**Response:**

```json
{
  "_id": "page-id",
  "title": "Page Title",
  "description": "Page Description"
}
```

**Errors:**

- 404 Not Found: Page not found.
- 500 Internal Server Error: Error fetching page details.

### DELETE /delete-page/:id

**Description:** Deletes a page and all associated posts.

**Response:**

```json
{
  "message": "Page deleted successfully"
}
```

**Errors:**

- 404 Not Found: Page not found.
- 500 Internal Server Error: Error deleting the page.

---

## Page Post Routes

### GET /get-all-page-posts

**Description:** Fetches all posts associated with pages.

**Response:**

```json
[
  {
    "_id": "post-id",
    "title": "Post Title",
    "content": "Post Content"
  }
]
```

**Errors:**

- 404 Not Found: No posts found.
- 500 Internal Server Error: Error fetching posts.

### GET /get-page-post/:id

**Description:** Fetches a specific page post by ID.

**Response:**

```json
{
  "_id": "post-id",
  "title": "Post Title",
  "content": "Post Content"
}
```

**Errors:**

- 404 Not Found: Post not found.
- 500 Internal Server Error: Error fetching the post.

---

## InfoCard Routes

### GET /get-all-infoCards

**Description:** Fetches all InfoCards.

**Response:**

```json
[
  {
    "_id": "infoCard-id",
    "title": "InfoCard Title",
    "description": "InfoCard Description"
  }
]
```

**Errors:**

- 404 Not Found: No InfoCards found.
- 500 Internal Server Error: Error fetching InfoCards.

### GET /get-info-card/:id

**Description:** Fetches details of a specific InfoCard by ID.

**Response:**

```json
{
  "_id": "infoCard-id",
  "title": "InfoCard Title",
  "description": "InfoCard Description"
}
```

**Errors:**

- 404 Not Found: InfoCard not found.
- 500 Internal Server Error: Error fetching the InfoCard.
