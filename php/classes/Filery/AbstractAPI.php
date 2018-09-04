<?php

namespace Filery;

use Exception;
use Throwable;

abstract class AbstractAPI
{
    /**
     * API configuration
     * @var array
     */
    protected $config = [];

    /**
     * Registered API actions
     * @var array
     */
    protected $actions = [];

    /**
     * AbstractAPI constructor.
     * @param array $config API Configuration
     */
    public function __construct($config)
    {
        $this->config = $config;
    }


    /**
     * Register API actions
     * @param string $method POST, GET, DELETE or PUT
     * @param array $queryKeys Keys of query parameters
     * @param callable $callback Callback when API action get called
     * @return self
     */
    protected function register($method, $queryKeys, $callback)
    {
        $key = $method . implode($queryKeys);
        $this->actions[$key] = $callback;

        return $this;
    }

    /**
     * Run API and echo JSON encode result as response.
     */
    public function run()
    {
        try {
            $this->cors();

            if (!is_readable($this->config['base']['path'])) {
                throw new Exception('Base path does not exist or is not readable.');
            }

            $output = $this->call();
        } catch (HttpException $ex) {
            http_response_code($ex->getCode());
            $output = [
                'error' => $ex->getMessage()
            ];
        } catch (Throwable $ex) {
            http_response_code(500);
            $output = [
                'error' => $ex->getMessage()
            ];
        } finally {
            header('Content-Type: application/json');
            echo json_encode($output);
            exit;
        }


    }

    /**
     * CORS handling
     * @see https://stackoverflow.com/a/9866124/2338829
     */
    protected function cors()
    {
        header("Access-Control-Allow-Origin: " . $this->config['accessControl']['allowedOrigin']);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
                header("Access-Control-Allow-Methods: " . $this->config['accessControl']['allowedMethods']);
            }

            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
                header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
            }

            exit(0);
        }
    }

    /**
     * Call registered API action
     * @return mixed
     * @throws HttpException
     */
    protected function call()
    {
        $key = $_SERVER['REQUEST_METHOD'] . implode(array_keys($_GET));
        if (isset($this->actions[$key])) {
            $callback = $this->actions[$key];
            if (is_callable($callback)) {
                return call_user_func($callback,
                    json_decode(file_get_contents('php://input'), true)
                );
            }
        }
        throw new HttpException(404);
    }
}
