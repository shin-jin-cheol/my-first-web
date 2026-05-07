create table if not exists guest_post_comments (
  id bigint generated always as identity primary key,
  guest_post_id bigint not null references guest_posts(id) on delete cascade,
  author_id text,
  author_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guest_posts'
      and column_name = 'comments'
  ) then
    insert into guest_post_comments (
      guest_post_id,
      author_id,
      author_name,
      content,
      created_at
    )
    select
      guest_posts.id,
      comment_item.value ->> 'authorId',
      coalesce(nullif(comment_item.value ->> 'authorName', ''), 'Unknown'),
      coalesce(comment_item.value ->> 'content', ''),
      case
        when comment_item.value ->> 'dateTime' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$'
          then ((comment_item.value ->> 'dateTime')::timestamp at time zone 'Asia/Seoul')
        else now()
      end
    from guest_posts
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(guest_posts.comments) = 'array' then guest_posts.comments
        else '[]'::jsonb
      end
    ) as comment_item(value)
    where coalesce(comment_item.value ->> 'content', '') <> '';

    alter table guest_posts drop column comments;
  end if;
end $$;
