\c nc_news_test
-- COUNT(comments.article_id) 
-- SELECT * FROM articles 

-- SELECT * FROM users



-- SELECT users.username, articles.*, COUNT(comments.article_id)  FROM articles 
-- JOIN comments ON articles.article_id = comments.article_id 
-- JOIN users on articles.author = users.username
-- GROUP BY users.username;

SELECT users.username AS author, articles.title,articles.article_id, articles.topic,articles.created_at, articles.votes,  COUNT(comments.article_id) AS comment_count FROM articles
LEFT JOIN users on articles.author = users.username
FULL JOIN comments ON articles.article_id = comments.article_id 
GROUP BY users.username, articles.article_id
ORDER BY created_at DESC