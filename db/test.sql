\c nc_news_test
-- COUNT(comments.article_id) 
-- SELECT * FROM articles WHERE article_id = 1;

-- SELECT * FROM comments WHERE article_id = 1;



SELECT articles.*, COUNT(comments.article_id)  FROM articles 
JOIN comments ON articles.article_id = comments.article_id 
WHERE articles.article_id = 9
GROUP BY articles.article_id;