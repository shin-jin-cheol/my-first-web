ALTER TABLE post_reactions
  DROP CONSTRAINT IF EXISTS post_reactions_member_id_fkey;

ALTER TABLE post_comment_reactions
  DROP CONSTRAINT IF EXISTS post_comment_reactions_member_id_fkey;

ALTER TABLE guest_post_reactions
  DROP CONSTRAINT IF EXISTS guest_post_reactions_member_id_fkey;

ALTER TABLE guest_comment_reactions
  DROP CONSTRAINT IF EXISTS guest_comment_reactions_member_id_fkey;
