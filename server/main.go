package main

import (
	"container/list"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Point struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type RequestBody struct {
	Start Point `json:"start"`
	End   Point `json:"end"`
}

func searchPath(grid [][]int, start, end Point) []Point {
	rows, cols := len(grid), len(grid[0])
	directions := []Point{{0, 1}, {1, 0}, {0, -1}, {-1, 0}}
	visited := make([][]bool, rows)
	for i := range visited {
		visited[i] = make([]bool, cols)
	}

	queue := list.New()
	queue.PushBack([]Point{start})

	visited[start.X][start.Y] = true

	for queue.Len() > 0 {
		path := queue.Front().Value.([]Point)
		queue.Remove(queue.Front())

		curr := path[len(path)-1]
		if curr.X == end.X && curr.Y == end.Y {
			return path
		}

		for _, dir := range directions {
			newRow, newCol := curr.X+dir.X, curr.Y+dir.Y
			if newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && !visited[newRow][newCol] && grid[newRow][newCol] == 0 {
				visited[newRow][newCol] = true
				newPath := append([]Point(nil), path...)
				newPath = append(newPath, Point{newRow, newCol})
				queue.PushBack(newPath)
			}
		}
	}

	return nil
}

func handleRequest(c *gin.Context) {
	var body RequestBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	grid := make([][]int, 20)
	for i := range grid {
		grid[i] = make([]int, 20)
	}

	path := searchPath(grid, body.Start, body.End)

	if path == nil {
		c.JSON(http.StatusOK, gin.H{"message": "No path found"})
	} else {
		c.JSON(http.StatusOK, gin.H{"path": path})
	}
}

func main() {
	l := gin.Default()
	l.Use(cors.Default())
	l.POST("/find-path", handleRequest)
	l.Run(":8080")
}
