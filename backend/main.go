package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"culture-resources/backend/config"
	"culture-resources/backend/controllers"
	"culture-resources/backend/middleware"
	"culture-resources/backend/models"
	"culture-resources/backend/services"
)

func main() {
	// 加载配置
	if err := config.Load(); err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 初始化MongoDB连接
	client, err := mongo.Connect(nil, options.Client().ApplyURI(os.Getenv("MONGODB_URI")))
	if err != nil {
		log.Fatalf("连接MongoDB失败: %v", err)
	}
	defer client.Disconnect(nil)

	// 获取数据库实例
	db := client.Database(os.Getenv("MONGODB_DATABASE"))

	// 初始化服务
	authService := services.NewAuthService(db)
	commentService := services.NewCommentService(db)

	// 初始化控制器
	authController := controllers.NewAuthController(authService, os.Getenv("JWT_SECRET"))
	commentController := controllers.NewCommentController(commentService)

	// 创建 Gin 引擎
	r := gin.Default()

	// 注册中间件
	r.Use(middleware.Cors())
	r.Use(middleware.ErrorHandler())

	// API 路由组
	api := r.Group("/api")
	{
		// 认证相关路由
		auth := api.Group("/auth")
		{
			auth.POST("/register", authController.Register)
			auth.POST("/login", authController.Login)
		}

		// 需要认证的路由
		authenticated := api.Group("")
		authenticated.Use(authController.AuthMiddleware)
		{
			// 注册评论相关路由
			commentController.RegisterRoutes(authenticated)
		}
	}

	// 启动服务器
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("启动服务器失败: %v", err)
	}
} 