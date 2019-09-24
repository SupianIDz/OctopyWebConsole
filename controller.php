<?php

/**
 *   ___       _
 *  / _ \  ___| |_ ___  _ __  _   _
 * | | | |/ __| __/ _ \| '_ \| | | |
 * | |_| | (__| || (_) | |_) | |_| |
 *  \___/ \___|\__\___/| .__/ \__, |
 *                     |_|    |___/.
 * @author  : Supian M <supianidz@gmail.com>
 * @link    : www.octopy.id
 * @license : MIT
 */

namespace Octopy;

class Console
{
    /**
     * @var string
     */
    protected $config;

    /**
     * @param array $config
     */
    public function __construct(array $config = [])
    {
        session_start();

        if (! isset($_SESSION['directory'])) {
            $_SESSION['directory'] = __DIR__ . '/';
        }
    }

    /**
     * @param  string $command
     * @return void
     */
    public function execute(string $command) : void
    {
        if (is_null($command) || $command == '') {
            exit;
        }

        $commands = explode('&&', urldecode($command));
        foreach ($commands as $offset => $value) {
            $value = trim($value);
            if (preg_match('/^cd\s+(?<path>.+?)$/i', $value, $match)) {
                $commands[$offset] = $this->changedir($match['path']);
            } else {
                $commands[$offset] = $value;
            }
        }

        echo preg_replace('#\\x1b[[][^A-Za-z]*[A-Za-z]#', '', $this->proc(
            'cd ' . $_SESSION['directory'] .' && ' . implode(' && ', $commands)
        ));
    }

    /**
     * @param  string $command
     * @return string
     */
    protected function proc(string $command) : string
    {
        $descriptors = [
            0 => ["pipe", "r"], // stdin  - read channel
            1 => ["pipe", "w"], // stdout - write channel
            2 => ["pipe", "w"], // stdout - error channel
            3 => ["pipe", "r"], // stdin  - This is the pipe we can feed the password into
        ];

        $process = proc_open($command, $descriptors, $pipes);

        if (! is_resource($process)) {
            die('Can\'t open resource with proc_open');
        }

        // nothing to push to input
        fclose($pipes[0]);

        $output = stream_get_contents($pipes[1]);
        fclose($pipes[1]);

        $error = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        // TODO: write passphrase in pipes[3]
        fclose($pipes[3]);

        // close all pipes before proc_close
        $code = proc_close($process);

        if ($code > 0 && $error != null) {
            return $error;
        }

        return $output;
    }

    /**
     * @param  string $directory
     * @return void
     */
    protected function changedir(string $directory)
    {
        $directory .= '/';
        if (substr($directory, 0, 1) !== '/') {
            $directory = $_SESSION['directory'] . '/' . $directory;
        }

        if (! is_dir($directory)) {
            die(
                sprintf('sh: cd: %s: No such file or directory', trim(str_replace($_SESSION['directory'], '', $directory), '/'))
            );
        }

        return 'cd ' . $_SESSION['directory'] = realpath($directory);
    }
}
